<?php
 /**
 * PluginControllerFactoryTest.php
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmPwsProfileInfo\test\RcmPwsProfileInfo\Factory
 * @author    Inna Davis <idavis@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   GIT: <git_id>
 * @link      https://github.com/reliv
 */

namespace RcmPwsProfileInfoTest\Factory;

use RcmPwsProfileInfo\Controller\PluginController;
use RcmPwsProfileInfo\Factory\PluginControllerFactory;
use Zend\ServiceManager\ServiceManager;

require_once __DIR__ . '/../../autoload.php';


 /**
 * PluginControllerFactoryTest
 *
 * LongDescHere
 *
 * PHP version 5
 *
 * @category  Reliv
 * @package   RcmPwsProfileInfo\test\RcmPwsProfileInfo\Factory
 * @author    Inna Davis <idavis@relivinc.com>
 * @copyright 2014 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: <package_version>
 * @link      https://github.com/reliv
 */

class PluginControllerFactoryTest extends \PHPUnit_Framework_TestCase
{
    public function testCreateService() {

        $config = [
            'rcmPlugin' => [
            'RcmPwsProfileInfo' => [
                'type' => 'Content Templates',
                'display' => 'Pws User Info',
                'tooltip' => '',
                'icon' => '',
                'editJs' => ''],
            ],
        ];
        $mockCurrentSite = $this->getMockBuilder('Rcm\Entity\Site')
            ->disableOriginalConstructor()
            ->getMock();
        $mockS3Client = $this->getMockBuilder('Aws\S3\S3Client')
            ->disableOriginalConstructor()
            ->getMock();
        $mockCurrentPws = $this->getMockBuilder('Pws\Service\CurrentPws')
            ->disableOriginalConstructor()
            ->getMock();

        $serviceManager = new ServiceManager();

        $serviceManager->setService(
            'config',
             $config
        );

        $serviceManager->setService(
            'Rcm\Entity\Site',
             $mockCurrentSite
        );
        $serviceManager->setService(
            'Aws\S3\S3Client',
            $mockS3Client
        );
        $serviceManager->setService(
            'Pws\Service\CurrentPws',
            $mockCurrentPws
        );

        $factory = new PluginControllerFactory();
        $object = $factory->createService($serviceManager);

        $this->assertTrue($object instanceof PluginController);



    }
}
 