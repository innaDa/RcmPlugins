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
 * @author    authorFirstAndLast <author@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   GIT: <git_id>
 * @link      https://github.com/reliv
 */

namespace RcmPwsProfileInfo\Controller;

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
 * @author    authorFirstAndLast <author@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: <package_version>
 * @link      https://github.com/reliv
 */

class PluginController extends BaseController implements PluginInterface
{
    public function renderInstance($instanceId, $instanceConfig) {

        $view = parent::renderInstance(
            $instanceId,
            $instanceConfig
        );

        echo 'Hello';
        return $view;
    }




}
 