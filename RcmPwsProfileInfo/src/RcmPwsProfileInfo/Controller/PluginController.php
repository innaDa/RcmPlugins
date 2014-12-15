<?php
 /**
 * PluginController.php
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmPwsProfileInfo\src\RcmPwsProfileInfo\Controller
 * @author    Inna Davis <idavis@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   GIT: <git_id>
 * @link      https://github.com/reliv
 */

namespace RcmPwsProfileInfo\Controller;

use Aws\S3\S3Client;
use Pws\Service\CurrentPws;
use Rcm\Entity\Site;
use Rcm\Http\Response;
use Rcm\Plugin\BaseController;
use Rcm\Plugin\PluginInterface;


/**
 * PluginController
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmPwsProfileInfo\src\RcmPwsProfileInfo\Controller
 * @author    Inna Davis <idavis@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: <package_version>
 * @link      https://github.com/reliv
 */

class PluginController extends BaseController implements PluginInterface
{
    protected $config;
    protected $currentSite;
    protected $S3Client;
    protected $currentPwsService;

    /**
     * @param null          $config
     * @param Site          $currentSite
     * @param S3Client      $S3Client
     * @param CurrentPws    $currentPwsService
     */
    public function __construct(
        $config,
        Site $currentSite,
        S3Client $S3Client,
        CurrentPws $currentPwsService
    ) {
        parent::__construct($config);
        $this->currentSite = $currentSite;
        $this->S3Client = $S3Client;
        $this->currentPwsService = $currentPwsService;
    }

    /**
     * Plugin Action - Returns the guest-facing view model for this plugin
     *
     * @param int $instanceId plugin instance id
     * @param array $instanceConfig Instance Config
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function renderInstance($instanceId, $instanceConfig) {

        $view = parent::renderInstance(
            $instanceId,
            $instanceConfig
        );

        $currentSiteId = $this->currentSite->getSiteId();

        $pwsSite = $this->currentPwsService->getPwsSite($this->currentSite);
        if(!isset($pwsSite)) {
            $response = new Response();
            $response->setStatusCode(401);
            return $response;
        }

        $imgUrl = $this->getPwsImgUrl($pwsSite, $currentSiteId);
        $ownersInfo = $this->getPwsOwnerInfo($pwsSite);

        $view->setVariable('imgUrl', $imgUrl);
        $view->setVariable('ownersInfo', $ownersInfo);

        return $view;
    }

    /*
     * pull pws owner info from pwsProfile Entity
     *
     * @return array
     */
    public function getPwsOwnerInfo($pwsSite)
    {
       $pwsProfile = $pwsSite->getPwsProfile();
       return [
        'ownersName' => $pwsProfile->getName(),
        'ownersPhone' => $pwsProfile->getPhone(),
        'ownersEmail' => $pwsProfile->getEmail()
       ];
    }

    /*
     * pws profile image logic
     *
     * return string
     */
    public function getPwsImgUrl($pwsSite, $currentSiteId)
    {
        $bucket = $this->config['pwsImageFileStorage']['S3']['bucket'];
        $this->S3Client->registerStreamWrapper();
        $image = $pwsSite->getImage();
        if (empty($image)) {
            $basePwsSite = $this->currentPwsService->getPwsSite($pwsSite->getBaseSite());
            $baseSiteImage = $basePwsSite->getImage();
            if(empty($baseSiteImage)) {
                $defaultImage = $this->config['defaultProfileImage']['imgSrc'];
                return $defaultImage;

            }
            $baseImagePath = $baseSiteImage->getImagePath();
            $baseImgUrl =  $imgUrl = $this->S3Client->getObjectUrl(
                $bucket,
                'pws/' . $currentSiteId . '/cropped/' . '/' . $baseImagePath
            );
            return $baseImgUrl;
        } else {
            $imagePath = $image->getImagePath();
            $imgUrl = $this->S3Client->getObjectUrl(
                $bucket,
                'pws/' . $currentSiteId . '/cropped/' . '/' . $imagePath
            );
            return $imgUrl;
        }
    }

}
 