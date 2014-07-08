<?php

/**
 * ZF2 Plugin Config file
 *
 * This file contains all the configuration for the Module as defined by ZF2.
 * See the docs for ZF2 for more information.
 *
 * PHP version 5.3
 *
 * LICENSE: No License yet
 *
 * @category  Reliv
 * @author    Westin Shafer <wshafer@relivinc.com>
 * @copyright 2012 Reliv International
 * @license   http://www.nolicense.com None
 * @version   GIT: <git_id>
 */

return array(

    'rcmPlugin' => array(
        'RcmPortalAnnouncementBox' => array(
            'type' => 'Content Templates',
            'display' => 'Feature Box',
            'tooltip' => 'Editable box with three text areas',
            'icon' => '',
            'editJs' => '/modules/rcm-portal-announcement-box/edit.js',
            'defaultInstanceConfig' => include
                    __DIR__ . '/defaultInstanceConfig.php'
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
    ),
    'asset_manager' => array(
        'resolver_configs' => array(
            'aliases' => array(
                'modules/rcm-portal-announcement-box/' =>
                    __DIR__ . '/../public/',
            ),
        ),
    ),
);