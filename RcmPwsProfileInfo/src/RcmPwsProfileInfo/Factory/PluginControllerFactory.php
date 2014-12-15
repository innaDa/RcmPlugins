<?php
 /**
 * PluginControllerFactory.php
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmPwsProfileInfo\Factory
 * @author    authorFirstAndLast <author@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   GIT: <git_id>
 * @link      https://github.com/reliv
 */

namespace RcmPwsProfileInfo\Factory;

use RcmPwsProfileInfo\Controller\PluginController;
use Zend\ServiceManager\FactoryInterface;
use Zend\ServiceManager\ServiceLocatorInterface;


/**
 * PluginControllerFactory
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmPwsProfileInfo\Factory
 * @author    authorFirstAndLast <author@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: <package_version>
 * @link      https://github.com/reliv
 */

class PluginControllerFactory implements FactoryInterface {

    public function createService(ServiceLocatorInterface $serviceLocator)
    {
        $controller = new PluginController(
            $serviceLocator->get('config'),
            $serviceLocator->get(
                'Rcm\Entity\Site'),
            $serviceLocator->get('Aws\S3\S3Client'),
            $serviceLocator->get(
                'Pws\Service\CurrentPws'
            )
        );
        return $controller;
    }

}
 