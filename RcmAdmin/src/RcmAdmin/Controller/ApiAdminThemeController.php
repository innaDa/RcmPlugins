<?php


namespace RcmAdmin\Controller;

use Rcm\View\Model\ApiJsonModel;
use Zend\Mvc\Controller\AbstractRestfulController;


/**
 * Class ApiAdminThemeController
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmAdmin\Controller
 * @author    James Jervis <jjervis@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: <package_version>
 * @link      https://github.com/reliv
 */

class ApiAdminThemeController extends AbstractRestfulController {

    /**
     * getEntityManager
     *
     * @return \Doctrine\ORM\EntityManagerInterface
     */
    protected function getEntityManager()
    {
        return $this->serviceLocator->get('Doctrine\ORM\EntityManager');
    }

    /**
     * getThemesConfig
     *
     * @return array
     */
    protected function getThemesConfig()
    {
        $config = $this->serviceLocator->get('config');

        $myConfig = $config['Rcm'];

        if(empty($myConfig['themes'])){
            return array();
        }

        return $myConfig['themes'];
    }

    /**
     * getList
     *
     * @return mixed|JsonModel
     */
    public function getList()
    {
        //ACCESS CHECK
        if (!$this->rcmIsAllowed(
            'sites',
            'admin'
        )
        ) {
            $this->getResponse()->setStatusCode(Response::STATUS_CODE_401);
            return $this->getResponse();
        }

        $themes = $this->getThemesConfig();

        return new ApiJsonModel($themes, null, 1, 'Success');
    }

} 