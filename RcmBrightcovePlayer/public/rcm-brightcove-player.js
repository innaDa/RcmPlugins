rcm.addAngularModule('rcmBrightcovePlayer');
angular.module('rcmBrightcovePlayer', [])
    .directive(
    'rcmBrightcovePlayerDownloadLink',
    function () {

        var registeredEvent = false;

        return {
            compile: function (elm, attrs) {

                var instanceId = attrs.rcmBrightcovePlayerDownloadLink;

                var instanceConfig = JSON.parse(attrs.rcmBrightcovePlayerDownloadLinkConfig);

                var playerController = RcmBrightcovePlayerService.getPlayerController(
                    instanceId,
                    instanceConfig,
                    function () {
                    }
                );

                return function (scope, elm, attrs) {

                    if (!registeredEvent) {

                        RcmBrightcovePlayerService.eventManager.on(
                            'downloadUrlChange',
                            function (playerCtrl) {
                                if (instanceId == playerCtrl.instanceId) {
                                    scope.$apply();
                                }
                            }
                        );

                        registeredEvent = true;
                    }

                    scope.playerController = playerController;
                };
            },

            template: '<a href="{{playerController.downloadUrl}}" ng-show="playerController.downloadUrl"><span data-textEdit="download" ng-model="playerController.instanceConfig.download">{{playerController.instanceConfig.download}}</span></span></a>'
        };
    }
)
    .directive(
    'rcmBrightcovePlayer',
    [
        '$compile',
        function ($compile) {

            /* @todo - we need to revist this to mak things display on edit
            var getTemplate = function (scope, playerController) {

                var template = '<div>' +
                    '<!-- Start of Brightcove Player -->' +
                    '<object id="' + playerController.experienceId + '" class="BrightcoveExperience">' +
                    ' <param name="bgcolor" value="#FFFFFF"/>' +
                    ' <param name="width" value="' + playerController.instanceConfig.playerConfig.width + '"/>' +
                    ' <param name="height" value="' + playerController.instanceConfig.playerConfig.height + '"/>' +
                    ' <param name="playerID" value="' + playerController.instanceConfig.playerConfig.playerID + '"/>' +
                    ' <param name="playerKey" value="' + playerController.instanceConfig.playerConfig.playerKey + '" />' +
                    ' <param name="isVid" value="true"/>' +
                    ' <param name="isUI" value="true"/>' +
                    ' <param name="dynamicStreaming" value="true"/>' +
                    ' <param name="mute" value="true"/>' +
                    ' <param name="secureConnections" value="true"/>' +
                    ' <param name="secureHTMLConnections" value="true"/>' +
                    ' <param name="wmode" value="opaque"/>' +
                    ' <param name="includeAPI" value="true" />';


                if (playerController.videoId) {
                    //template.concat('<param name="@videoPlayer" value="' + playerController.videoId + '"/>');
                }

                if (playerController.onTemplateLoad) {
                    template.concat('<param name="templateLoadHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + playerController.instanceId + '\').onTemplateLoad"/>');
                }

                if (playerController.onTemplateReady) {
                    template.concat('<param name="templateReadyHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + playerController.instanceId + '\').onTemplateReady"/>');
                }

                template.concat('</object>' +
                                '<!-- End of Brightcove Player -->' +
                                '</div>');

                return template;
            };

            var getAngularTemplate = function (scope, playerController) {

                scope.playerController = playerController;

                var template = '<!-- Start of Brightcove Player -->' +
                    '<object id="' + playerController.experienceId + '" class="BrightcoveExperience">' +
                    ' <param name="bgcolor" value="#FFFFFF"/>' +
                    ' <param name="width" value="{{playerController.instanceConfig.playerConfig.width}}"/>' +
                    ' <param name="height" value="{{playerController.instanceConfig.playerConfig.height}}"/>' +
                    ' <param name="playerID" value="{{playerController.instanceConfig.playerConfig.playerID}}"/>' +
                    ' <param name="playerKey" value="{{playerController.instanceConfig.playerConfig.playerKey}}" />' +
                    ' <param name="isVid" value="true"/>' +
                    ' <param name="isUI" value="true"/>' +
                    ' <param name="dynamicStreaming" value="true"/>' +
                    ' <param name="mute" value="true"/>' +
                    ' <param name="secureConnections" value="true"/>' +
                    ' <param name="secureHTMLConnections" value="true"/>' +
                    ' <param name="wmode" value="opaque"/>' +
                    ' <param name="includeAPI" value="true" />';

                if (scope.playerController.videoId) {
                    //template.concat('<param name="@videoPlayer" value="' + scope.playerController.videoId + '"/>');
                }

                if (playerController.onTemplateLoad) {
                    template.concat('<param name="templateLoadHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + scope.playerController.instanceId + '\').onTemplateLoad"/>');
                }

                if (playerController.onTemplateReady) {
                    template.concat('<param name="templateReadyHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + scope.playerController.instanceId + '\').onTemplateReady"/>');
                }

                template.concat('</object>' +
                                '<!-- End of Brightcove Player -->');

                return jQuery(template);
            };
            */

            return {
                compile: function (tElm, tAttrs) {
                    var instanceId = tAttrs.rcmBrightcovePlayer;
                    var instanceConfig = JSON.parse(tAttrs.rcmBrightcovePlayerConfig);

                    var objectElm = tElm.children(":first");

                    var playerController = RcmBrightcovePlayerService.getPlayerController(
                        instanceId,
                        instanceConfig,
                        function (playerCtrl) {
                        }
                    );

                    objectElm.attr('id', playerController.experienceId);

                    if (playerController.videoId) {
                        objectElm.append('<param name="@videoPlayer" value="' + playerController.videoId + '"/>');
                    }

                    if (playerController.onTemplateLoad) {
                        objectElm.append('<param name="templateLoadHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + instanceId + '\').onTemplateLoad"/>');
                    }

                    if (playerController.onTemplateReady) {
                        objectElm.append('<param name="templateReadyHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + instanceId + '\').onTemplateReady"/>');
                    }

                    return function (scope, elm, attrs) {

                        scope.playerController = playerController;
                    };

                    /**
                    return function (scope, elm, attrs) {

                        var instanceId = attrs.rcmBrightcovePlayer;
                        var instanceConfig = JSON.parse(attrs.rcmBrightcovePlayerConfig);

                        console.log('compile',instanceId, instanceConfig);

                        var playerController = RcmBrightcovePlayerService.getPlayerController(
                            instanceId,
                            instanceConfig,
                            function (playerCtrl) {

                                console.log(playerCtrl);
                                var template = getTemplate(scope, playerCtrl)

                                //scope.$apply(
                                //    function () {
                                        var linkFn = $compile(template);

                                        var content = linkFn(scope);

                                        console.log(content);

                                        elm.replaceWith(content);

                                        playerCtrl.create();
                                //    }
                                //);
                            }
                        );


                        //scope.$apply(
                        //    function () {
                        //        $compile(tElm)(scope);
                        //        console.log('apply', elm.html());
                        //        scope.playerController.create();
                        //    }
                        //);

                    }
                     */
                },

                restrict: 'A',

                template: '<!-- Start of Brightcove Player -->' +
                '<object id="myExperienceXXX" class="BrightcoveExperience">' +
                ' <param name="bgcolor" value="#FFFFFF"/>' +
                ' <param name="width" value="{{playerController.instanceConfig.playerConfig.width}}"/>' +
                ' <param name="height" value="{{playerController.instanceConfig.playerConfig.height}}"/>' +
                ' <param name="playerID" value="{{playerController.instanceConfig.playerConfig.playerID}}"/>' +
                ' <param name="playerKey" value="{{playerController.instanceConfig.playerConfig.playerKey}}" />' +
                ' <param name="isVid" value="true"/>' +
                ' <param name="isUI" value="true"/>' +
                ' <param name="dynamicStreaming" value="true"/>' +
                ' <param name="mute" value="true"/>' +
                ' <param name="secureConnections" value="true"/>' +
                ' <param name="secureHTMLConnections" value="true"/>' +
                ' <param name="wmode" value="opaque"/>' +
                ' <param name="includeAPI" value="true" />' +
                    //' <param name="@videoPlayer" value="{{playerController.videoId}}"/>' +
                    //' <param name="templateLoadHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + instanceId + '\').onTemplateLoad"/>' +
                    //' <param name="templateReadyHandler" value="RcmBrightcovePlayerService.getPlayerController(\'' + instanceId + '\').onTemplateReady"/>' +
                '</object>' +
                '<!-- End of Brightcove Player -->'
            }
        }
    ]
)
    .directive(
    'rcmBrightcovePlayerTabs',
    [
        '$compile',
        function ($compile) {

            var registeredEvent = false;

            var updateTabs = function (scope, elm, playlists, onComplete) {

                var tabWrapperElm = elm.find('.rcm-brightcove-player-tabs-wrapper');

                var rcmBrightcovePlayerTabs = tabWrapperElm.find('.rcmBrightcovePlayerTabs');
                var rcmBrightcovePlayerTabsContent = tabWrapperElm.find('.rcmBrightcovePlayerTabs');
                rcmBrightcovePlayerTabs.html('');

                rcmBrightcovePlayerTabsContent.html('');

                jQuery.each(
                    playlists,
                    function (key, playlist) {
                        rcmBrightcovePlayerTabs.append(
                            '<li><a href="#tabs-' + key + '">' + playlist.name + '</a></li>'
                        );

                        var tabContent = jQuery('<div class="videoAreaWrap" id="tabs-' + key + '" ></div>');

                        jQuery.each(
                            playlist.videos,
                            function (pkey, video) {
                                tabContent.append(
                                    '<div>' +
                                    '  <a href="javascript:void(0);" ng-click="videoClick(' + video.id + ')" class="videoArea" >' +
                                    '    <table>' +
                                    '     <tr>' +
                                    '      <td style="text-align: left;">' +
                                    '       <img src="' + video.thumbnailURL + '" width="135px" height="70px"/>' +
                                    '       </td>' +
                                    '      </tr>' +
                                    '      <tr>' +
                                    '       <td>' +
                                    '        <span class="title">' +
                                    '         <p style="text-decoration: none; color: #00a4e4; font-weight: bold; font-size: 10px;">' + video.name + '</p>' +
                                    '        </span>' +
                                    '       </td>' +
                                    '       </tr>' +
                                    '       <tr>' +
                                    '        <td>' +
                                    '         <span class="description">' +
                                    '          <p style="text-decoration: none;font-size: 10px;">' + video.shortDescription + '</p>' +
                                    '         </span>' +
                                    '        </td>' +
                                    '       </tr>' +
                                    '      </table>' +
                                    '   </a>' +
                                    '</div>'
                                );
                            }
                        );

                        tabWrapperElm.append(tabContent);
                    }
                );

                tabWrapperElm.tabs();

                $compile(tabWrapperElm.contents())(scope);

                if (typeof onComplete === 'function') {
                    onComplete();
                }
            };

            var controller = function ($scope) {

                $scope.testme = 'test';

                $scope.videoClick = function (videoId) {

                    $scope.playerController.loadVideoById(videoId);
                };
            };

            var compile = function (tElem, tAttr) {

                return function (scope, elm, attrs, controller, transcludeFn) {

                    scope.instanceId = attrs.rcmBrightcovePlayerTabs;

                    scope.instanceConfig = JSON.parse(attrs.rcmBrightcovePlayerTabsConfig);

                    scope.playerController = RcmBrightcovePlayerService.getPlayerController(
                        scope.instanceId,
                        scope.instanceConfig,
                        function () {
                        }
                    );

                    if (!registeredEvent) {

                        var updateEvent = function (playerCtrl) {

                            scope.playlists = playerCtrl.playlists;

                            if (scope.instanceId == playerCtrl.instanceId) {
                                setTimeout(
                                    function () {
                                        updateTabs(
                                            scope,
                                            elm,
                                            playerCtrl.playlists
                                        );
                                    }
                                );
                            }
                        };

                        RcmBrightcovePlayerService.eventManager.on(
                            'playlistsBuilt',
                            updateEvent
                        );

                        registeredEvent = true;
                    }
                }
            };

            var template = '' +
                '<div class="rcm-brightcove-player-tabs-wrapper">' +
                ' <ul class="rcmBrightcovePlayerTabs">' +
                '  <li ng-repeat="(key,playlist) in playlists">' +
                '   {{playlist.videos.length | json}}' +
                '   <a href="#tabs-{{key}}">{{playlist.name}}</a>' +
                '  </li>' +
                ' </ul>' +
                ' <div class="rcmBrightcovePlayerTabsContent"></div>' +
                '  <div class="videoAreaWrap" ng-repeat="(tkey,tplaylist) in playlists" id="tabs-{{tkey}}">' +
                '   <div ng-repeat="video in tplaylist.videos">' +
                '    <a href="javascript:void(0);" ng-click="videoClick(video.id)" class="videoArea">' +
                '     <table>' +
                '      <tr>' +
                '       <td style="text-align: left;">' +
                '        <img ng-src="{{video.thumbnailURL}}" width="135px" height="70px"/>' +
                '       </td>' +
                '      </tr>' +
                '      <tr>' +
                '       <td>' +
                '        <span class="title">' +
                '         <p style="text-decoration: none; color: #00a4e4; font-weight: bold; font-size: 10px;">' +
                '         {{video.name}}' +
                '         </p>' +
                '        </span>' +
                '       </td>' +
                '      </tr>' +
                '      <tr>' +
                '       <td>' +
                '        <span class="description">' +
                '         <p style="text-decoration: none;font-size: 10px;">' +
                '         {{video.shortDescription}}' +
                '         </p>' +
                '        </span>' +
                '       </td>' +
                '      </tr>' +
                '     </table>' +
                '    </a>' +
                '   </div>' +
                '  </div>' +
                '</div>'

            return {
                compile: compile,
                controller: controller,
                restrict: 'A' //template: template
            };
        }
    ]
);


/**
 * RcmBrightcovePlayerService
 * @type {{}}
 */
var RcmBrightcovePlayerService = {

    defaultInstanceConfig: {},

    playerControllers: {},

    configs: {},

    events: {},
    eventManager: {

        on: function (event, method) {

            if (!RcmBrightcovePlayerService.events[event]) {
                RcmBrightcovePlayerService.events[event] = [];
            }

            RcmBrightcovePlayerService.events[event].push(method);
        },

        trigger: function (event, args) {

            if (RcmBrightcovePlayerService.events[event]) {
                jQuery.each(
                    RcmBrightcovePlayerService.events[event],
                    function (index, value) {
                        value(args);
                    }
                );
            }
        }
    },

    buildInstanceConfig: function (instanceId, instanceConfig) {

        if (!instanceConfig) {
            instanceConfig = RcmBrightcovePlayerService.defaultInstanceConfig;
        }

        instanceConfig.playerConfig = RcmBrightcovePlayerService.playerConfig;

        RcmBrightcovePlayerService.configs[instanceId] = instanceConfig;

        return RcmBrightcovePlayerService.configs[instanceId];
    },

    getPlayerController: function (instanceId, instanceConfig, onComplete) {

        instanceId = instanceId.toString();

        instanceConfig = RcmBrightcovePlayerService.buildInstanceConfig(instanceId, instanceConfig);

        if (RcmBrightcovePlayerService.playerControllers[instanceId]) {

            RcmBrightcovePlayerService.playerControllers[instanceId].setInstanceConfig(instanceConfig);

            if (typeof onComplete === 'function') {

                onComplete(RcmBrightcovePlayerService.playerControllers[instanceId]);
            }

            return RcmBrightcovePlayerService.playerControllers[instanceId];
        }

        if (instanceConfig.type == 'multi-embed') {

            RcmBrightcovePlayerService.playerControllers[instanceId] = new RcmBrightcovePlayerMulti(instanceId, instanceConfig, onComplete);
            RcmBrightcovePlayerService.playerControllers[instanceId].create = brightcove.createExperiences;
        } else {

            RcmBrightcovePlayerService.playerControllers[instanceId] = new RcmBrightcovePlayerSingle(instanceId, instanceConfig, onComplete);
            RcmBrightcovePlayerService.playerControllers[instanceId].create = brightcove.createExperiences;
        }

        if (typeof onComplete === 'function') {

            onComplete(RcmBrightcovePlayerService.playerControllers[instanceId]);
        }

        return RcmBrightcovePlayerService.playerControllers[instanceId];
    },

    playerConfig: {
        width: 672,
        height: 378,
        playerID: 2660464878001,
        playerKey: "AQ~~,AAABWA8lTok~,NLWj-wltGTxQtoAwLzwEdE62BFMU_8At"
    }
};

/**
 * RcmBrightcovePlayerSingle
 * @param playerModel
 * @constructor
 */
var RcmBrightcovePlayerSingle = function (instanceId, instanceConfig, onComplete) {

    var self = this;
    self.instanceId = instanceId;
    self.instanceConfig = instanceConfig;
    self.downloadUrl = '';
    self.videoId = instanceConfig.videoId;
    self.experienceId = 'myExperience' + self.instanceId;

    self.setDownloadUrl = function (url) {

        if (self.downloadUrl !== url) {

            self.downloadUrl = url;
            RcmBrightcovePlayerService.eventManager.trigger('downloadUrlChange', self);
        }
    };

    self.setInstanceConfig = function (instanceConfig) {

        self.instanceConfig = instanceConfig;

        RcmBrightcovePlayerService.eventManager.trigger('setInstanceConfig', self);
    }

    self.onTemplateLoad = function (experienceID) {
    };

    self.onTemplateReady = function (evt) {
    };

    self.init = function (onComplete) {

        RcmBrightcoveApiService.getDownloadURL(
            self.videoId,
            function (url) {
                self.setDownloadUrl(url);
                RcmBrightcovePlayerService.eventManager.trigger('init', self);

                if (typeof onComplete === 'function') {
                    onComplete(self);
                }
            }
        );
    };

    self.init(onComplete);
};

/**
 * RcmBrightcovePlayerMulti
 * @param playerModel
 * @constructor
 */
var RcmBrightcovePlayerMulti = function (instanceId, instanceConfig, onComplete) {

    var self = this;
    self.instanceId = instanceId;
    self.instanceConfig = instanceConfig;
    self.downloadUrl = '';
    self.videoId = null; // active video
    self.experienceId = 'myExperience' + self.instanceId;

    self.templateReady = false;
    self.loadVideoIdWhenReady = 0;

    self.player;
    self.APIModules;
    self.videoPlayer;

    self.playlists = [];

    self.setInstanceConfig = function (instanceConfig) {

        self.instanceConfig = instanceConfig;

        RcmBrightcovePlayerService.eventManager.trigger('setInstanceConfig', self);
    }

    self.onTemplateLoad = function (experienceID) {

        self.player = brightcove.api.getExperience(experienceID);
        self.APIModules = brightcove.api.modules.APIModules;
        self.mediaEvent = brightcove.api.events.MediaEvent;

        self.videoPlayer = self.player.getModule(self.APIModules.VIDEO_PLAYER);
        self.videoPlayer.addEventListener(self.mediaEvent.BEGIN, self.onMediaBegin);
        self.videoPlayer.addEventListener(self.mediaEvent.COMPLETE, self.onMediaComplete);

        self.templateReady = true;

        if (self.loadVideoIdWhenReady) {
            self.cueVideoById(self.loadVideoIdWhenReady);
        }
    };

    self.onTemplateReady = function (evt) {

    };

    self.loadVideoById = function (videoId, callback) {

        self.videoPlayer.loadVideoByID(videoId);

        self.getDownloadURL(videoId, callback);
    };

    self.cueVideoById = function (videoId, callback) {

        if (self.templateReady) {

            // onTemplateReady has already been called so we can just cue the video
            self.videoPlayer.cueVideoByID(videoId);
            RcmBrightcovePlayerService.eventManager.trigger('cueVideo', videoId);
        } else {

            // onTemplateReady hasn't been called yet so we set this property to be used when it does get called
            self.loadVideoIdWhenReady = videoId;
        }

        self.getDownloadURL(videoId, callback);
    };

    self.onMediaBegin = function (evt) {
        //displayName  = evt.media.displayName;
        RcmBrightcovePlayerService.eventManager.trigger('onMediaBegin', self);
    }

    self.onMediaComplete = function (evt) {
        nextVideo++;
        if (nextVideo == videos.length) {
            nextVideo = 0;
        }

        self.videoPlayer.loadVideoByID(videos[nextVideo]);
        RcmBrightcovePlayerService.eventManager.trigger('onMediaComplete', self);
    };

    self.getDownloadURL = function (videoId, callback) {

        RcmBrightcoveApiService.getDownloadURL(
            videoId,
            function (url) {
                self.setDownloadUrl(url);
                if (typeof callback === 'function') {
                    callback(self);
                }
            }
        );
    };

    self.setDownloadUrl = function (url) {

        if (self.downloadUrl !== url) {

            self.downloadUrl = url;
            RcmBrightcovePlayerService.eventManager.trigger('downloadUrlChange', self);
        }
    };

    self.prepareData = function (data, callback) {

        self.playlists = data.items;
        // set videoId to play fo first video
        self.videoId = self.playlists[0].videos[0].id;

        if (typeof callback === 'function') {
            callback(self);
        }

        RcmBrightcovePlayerService.eventManager.trigger('playlistsBuilt', self);
    };

    /**
     * buildPlaylist
     * @param onComplete
     */
    self.buildPlaylist = function (onComplete) {

        RcmBrightcoveApiService.findPlaylistsById(
            self.instanceConfig.playlistIds,
            function (data) {
                self.prepareData(data, onComplete);
            }
        );
    };

    /**
     * init
     * @param onComplete
     */
    self.init = function (onComplete) {

        self.buildPlaylist(
            function (thisPlayer) {

                if (thisPlayer.videoId) {
                    thisPlayer.cueVideoById(thisPlayer.videoId)
                }

                if (typeof onComplete === 'function') {
                    onComplete(thisPlayer);
                }
            }
        );
    };

    self.init(onComplete);
};
