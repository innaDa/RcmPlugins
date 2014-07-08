<?php

/**
 * Online App Plugin Controller
 *
 * Main controller for the online app
 *
 * PHP version 5.3
 *
 * LICENSE: No License yet
 *
 * @category  Reliv
 * @author    Rod McNew <rmcnew@relivinc.com>
 * @copyright 2012 Reliv International
 * @license   License.txt New BSD License
 * @version   GIT: <git_id>
 */
namespace RcmEventListDisplay\Controller;

use Doctrine\ORM\EntityManager;
use RcmInstanceConfig\Service\PluginStorageMgr;

/**
 * Online App Plugin Controller
 *
 * Main controller for the online app
 *
 * @category  Reliv
 * @author    Rod McNew <rmcnew@relivinc.com>
 * @copyright 2012 Reliv International
 * @license   License.txt New BSD License
 * @version   Release: 1.0
 *
 */
class PluginController
    extends \RcmInstanceConfig\Controller\BasePluginController
    implements \Rcm\Plugin\PluginInterface
{
    /**
     * @var \RcmEventCalenderCore\Model\Calender $calender
     */
    protected $calender;

    function __construct(
        PluginStorageMgr $pluginStorageMgr,
        $config,
        EntityManager $entityMgr,
        \RcmEventCalenderCore\Model\Calender $calender
    ) {
        parent::__construct($pluginStorageMgr, $config);
        $this->calender = $calender;
    }

    /**
     * Plugin Action - Returns the guest-facing view model for this plugin
     *
     * @param int $instanceId plugin instance id
     *
     * @return \Zend\View\Model\ViewModel
     */
    function renderInstance($instanceId)
    {
        return $this->renderInstanceFromConfig(
            $this->getInstanceConfig($instanceId)
        );
    }

    function previewAdminAjaxAction()
    {

        $post = $this->getEvent()->getRequest()->getPost();
        return $this->renderInstanceFromConfig($post);
    }

    function renderInstanceFromConfig($instanceConfig)
    {

        $events = $this->calender->getEvents($instanceConfig['categoryId']);

        $view = new \Zend\View\Model\ViewModel(
            array(
                'instanceConfig' => $instanceConfig,
                'events' => $events
            )
        );
        $view->setTemplate($this->template);
        return $view;
    }
}

