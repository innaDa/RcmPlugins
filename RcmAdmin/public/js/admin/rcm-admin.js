/**
 * **************************************************************
 * Angular JS module used to show HTML editor and toolbar on a page
 * @require:
 *  AngularJS
 *  TinyMce
 *  RcmHtmlEditor
 */
angular.module(
        'rcmAdmin',
        ['RcmHtmlEditor']
    )
/**
 * rcmAdminService
 */
    .factory(
        'rcmAdminService',
        [
            function () {
                return RcmAdminService;
            }
        ]
    )
/**
 * rcmAdmin.rcmAdminMenuActions
 */
    .directive(
        'rcmAdminMenuActions',
        [
            '$compile',
            'rcmAdminService',
            function ($compile, rcmAdminService) {

                var thisLink = function (scope, elm, attrs) {
                    scope.rcmAdminPage = rcmAdminService.getPage(
                        $compile(elm.contents())(scope)
                    );
                };

                return {
                    restrict: 'A',
                    link: thisLink
                }
            }
        ]
    )
/**
 * rcmAdmin.rcmAdminEditButton
 */
    .directive(
        'rcmAdminEditButton',
        [
            'rcmAdminService',
            function (rcmAdminService) {

                var thisLink = function (scope, elm, attrs) {

                    scope.rcmAdminPage = rcmAdminService.getPage();

                    var editingState = attrs.rcmAdminEditButton;

                    elm.unbind();
                    elm.bind('click', null, function () {

                        rcmAdminService.rcmAdminEditButtonAction(
                            editingState,
                            function () {
                                scope.$apply();
                            }
                        );
                    });
                };

                return {
                    restrict: 'A',
                    link: thisLink
                }
            }
        ]
    )
/**
 * rcmAdmin.richedit
 */
    .directive(
        'richedit',
        [
            'rcmAdminService',
            'rcmHtmlEditorInit',
            'rcmHtmlEditorDestroy',
            function (rcmAdminService, rcmHtmlEditorInit, rcmHtmlEditorDestroy) {

                return {
                    link: rcmAdminService.getHtmlEditorLink(rcmHtmlEditorInit, rcmHtmlEditorDestroy, 'richedit'),
                    scope: {},
                    restrict: 'A',
                    require: '?ngModel'
                }
            }
        ]
    )
/**
 * rcmAdmin.textedit
 */
    .directive(
        'textedit',
        [
            'rcmAdminService',
            'rcmHtmlEditorInit',
            'rcmHtmlEditorDestroy',
            function (rcmAdminService, rcmHtmlEditorInit, rcmHtmlEditorDestroy) {


                return {
                    link: rcmAdminService.getHtmlEditorLink(rcmHtmlEditorInit, rcmHtmlEditorDestroy, 'textedit'),
                    scope: {},
                    restrict: 'A',
                    require: '?ngModel'
                }
            }
        ]
    );
/* <RcmAdminService> */
var RcmAdminService = {

    /**
     * page
     */
    page: null,

    /**
     * config
     */
    config: {
        unlockMessages: {
            sitewide: {
                title: "Unlock Site-Wide Plugins?",
                message: "Please Note: Any changes you make to a Site-Wide plugin will be published and made live when you save your changes."
            },
            page: {
                title: "Unlock Page Plugins?",
                message: null
            },
            layout: {
                title: "Unlock Layout Plugins?",
                message: null
            }
        }
    },

    /**
     * angularCompile
     * @param elm
     * @param fn
     */
    angularCompile: function (elm, fn) {

        var compile = angular.element(elm).injector().get('$compile');

        var scope = angular.element(elm).scope();

        compile(elm.contents())(scope);

        if (scope.$$phase || scope.$root.$$phase) {
            if (typeof fn === 'function') {
                fn();
            } else {
                scope.$apply(fn);
            }
        }
    },

    /**
     * rcmAdminEditButtonAction - Actions for links and AngularJS directives
     * @todo might require $apply
     * @param editingState
     * @param onComplete
     */
    rcmAdminEditButtonAction: function (editingState, onComplete) {

        var page = RcmAdminService.getPage();
        page.refresh(
            function (page) {

                if (!editingState) {
                    editingState = 'page';
                }

                if (editingState == 'arrange') {
                    //scope.rcmAdminPage.arrange();
                    page.setEditingOn('page');
                    page.setEditingOn('layout');
                    page.setEditingOn('sitewide');
                    RcmAvailablePluginsMenu.build();

                    page.arrange(true);

                    RcmPluginDrag.initDrag();

                    return;
                }

                if (editingState == 'cancel') {
                    page.cancel();
                    return;
                }

                if (editingState == 'save') {
                    page.save();
                    return;
                }

                page.setEditingOn(editingState);

                if (typeof onComplete === 'function') {

                    onComplete();
                }
            }
        );
    },

    /**
     * getHtmlEditorLink - creates an angular friendly method
     * @param rcmHtmlEditorInit
     * @param rcmHtmlEditorDestroy
     * @returns {Function}
     */
    getHtmlEditorLink: function (rcmHtmlEditorInit, rcmHtmlEditorDestroy, directiveId) {

        var page = RcmAdminService.getPage();

        return function (scope, elm, attrs, ngModel, config) {

            scope.rcmAdminPage = page;

            var pluginId = elm.attr('html-editor-plugin-id');

            var localId = attrs[directiveId];

            var toggleEditors = function () {

                if (!scope.rcmAdminPage.plugins[pluginId]) {
                    return;
                }

                if (scope.rcmAdminPage.plugins[pluginId].canEdit()) {

                    rcmHtmlEditorInit(
                        scope,
                        elm,
                        attrs,
                        ngModel,
                        config
                    );
                } else {
                    rcmHtmlEditorDestroy(
                        attrs.id
                    );
                }
            };

            if (pluginId) {

                toggleEditors();
            }
        }
    },

    /**
     * getPage
     * @param onBuilt
     * @returns {null}
     */
    getPage: function (onBuilt) {

        if (!RcmAdminService.page) {

            RcmAdminService.page = new RcmAdminService.RcmPage(
                RcmAdminService.RcmPageModel.getElm(),
                onBuilt
            );
        }
        return RcmAdminService.page
    },

    /**
     * getPlugin
     * @param id
     * @param onComplete
     * @returns {*}
     */
    getPlugin: function (id, onComplete) {

        var page = RcmAdminService.getPage(
            function (page) {
                if (typeof onComplete === 'function') {
                    onComplete(page.plugins[id]);
                }
            }

        );

        return page.plugins[id];
    },

    /**
     * RcmEventManager
     * @constructor
     */
    RcmEventManager: {

        events: {},

        on: function (event, method) {

            if (!this.events[event]) {
                this.events[event] = [];
            }

            this.events[event].push(method);
        },

        trigger: function (event, args) {

            if (this.events[event]) {
                jQuery.each(
                    this.events[event],
                    function (index, value) {
                        value(args);
                    }
                );
            }
        },

        hasEvents: function (event) {

            if (!this.events[event]) {
                return false;
            }

            if (this.events[event].length > 0) {
                return true;
            }

            return false;
        }
    },

    /**
     * RcmPageModel
     */
    RcmPageModel: {

        getDocument: function (onComplete) {

            var doc = jQuery(document);

            if (typeof onComplete === 'function') {
                onComplete(doc)
            }

            return doc;
        },

        getElm: function (onComplete) {

            var elm = jQuery('body');

            if (typeof onComplete === 'function') {
                onComplete(elm)
            }

            return elm;
        },

        getData: function (onComplete) {

            var data = {};
            data.title = jQuery(document).find("head > title").text();
            data.url = jQuery(location).attr('href');
            data.description = jQuery('meta[name="description"]').attr('content');
            data.keywords = jQuery('meta[name="keywords"]').attr('content');

            if (typeof onComplete === 'function') {
                onComplete(data)
            }

            return data;
        }
    },

    /**
     * RcmContainerModel
     */
    RcmContainerModel: {

        getElms: function (onComplete) {

            var pageElm = RcmAdminService.RcmPageModel.getElm();

            var elms = pageElm.find('[data-containerId]');

            if (typeof onComplete === 'function') {
                onComplete(elms)
            }

            return elms;
        },

        getElm: function (containerId, onComplete) {

            var pageElm = RcmAdminService.RcmPageModel.getElm();

            var elm = pageElm.find("[data-containerId='" + containerId + "']");

            if (typeof onComplete === 'function') {
                onComplete(elm)
            }

            return elm;
        },

        getId: function (containerElm, onComplete) {

            var id = containerElm.attr('data-containerId');

            if (typeof onComplete === 'function') {
                onComplete(id)
            }

            return id;
        },

        getData: function (containerId, onComplete) {

            var data = {};

            var elm = RcmAdminService.RcmContainerModel.getElm(containerId);

            data.id = containerId;

            data.revision = elm.attr('data-containerRevision');

            if (elm.attr('data-isPageContainer') == 'Y') {
                data.type = 'page';
            } else {
                data.type = 'layout';
            }

            if (typeof onComplete === 'function') {
                onComplete(data)
            }

            return data;
        }
    },

    /**
     * RcmPluginModel
     */
    RcmPluginModel: {

        getElms: function (containerId, onComplete) {

            var containerElm = RcmAdminService.RcmContainerModel.getElm(containerId);

            var elms = containerElm.find('[data-rcmPluginInstanceId]');

            if (typeof onComplete === 'function') {
                onComplete(elms)
            }

            return elms;
        },

        getElm: function (containerId, pluginId, onComplete) {

            var containerElm = RcmAdminService.RcmContainerModel.getElm(containerId);

            var elm = containerElm.find('[data-rcmPluginInstanceId="' + pluginId + '"]');

            elm = jQuery(elm[0]);

            if (typeof onComplete === 'function') {
                onComplete(elm)
            }

            return elm;
        },

        getId: function (pluginElm, onComplete) {

            var id = pluginElm.attr('data-rcmPluginInstanceId');

            if (typeof onComplete === 'function') {
                onComplete(id)
            }

            return id;
        },

        getName: function (pluginElm, onComplete) {

            var name = pluginElm.attr('data-rcmPluginName');

            if (typeof onComplete === 'function') {
                onComplete(name)
            }

            return name;
        },

        getData: function (containerId, id, onComplete) {

            var data = {};

            var elm = RcmAdminService.RcmPluginModel.getElm(containerId, id);

            data.containerId = containerId;

            data.instanceId = elm.attr('data-rcmPluginInstanceId');

            data.isSitewide = (elm.attr('data-rcmSiteWidePlugin') == '1');
            data.name = elm.attr('data-rcmPluginName');

            data.sitewideName = elm.attr('data-rcmPluginDisplayName');

            var resized = (elm.attr('data-rcmPluginResized') == 'Y');

            if (resized) {
                data.size = elm.width() + ',' + elm.height();
            }

            if (typeof onComplete === 'function') {
                onComplete(data)
            }

            return data;
        },
        getPluginContainer: function (pluginElm, onComplete) {

            var pluginContainerElm = pluginElm.find('.rcmPluginContainer');

            if (typeof onComplete === 'function') {
                onComplete(pluginContainerElm)
            }

            return pluginContainerElm;
        },
        getEditorElms: function (containerId, pluginId, onComplete) {

            var elm = RcmAdminService.RcmPluginModel.getElm(containerId, pluginId);

            var richEditors = elm.find('[data-richEdit]');
            var textEditors = elm.find('[data-textEdit]');

            var elms = {};

            richEditors.each(
                function (index) {
                    elms[jQuery(this).attr('data-richEdit')] = this;
                }
            );

            textEditors.each(
                function (index) {
                    elms[jQuery(this).attr('data-textEdit')] = this;
                }
            );

            if (typeof onComplete === 'function') {
                onComplete(elms)
            }

            return elms;
        }
    },

    RcmPluginViewModel: {

        /**
         * disableEdit
         * @param onComplete
         */
        disableEdit: function (elm, type, onComplete) {

            var id = RcmAdminService.RcmPluginModel.getId(elm);

            var page = RcmAdminService.getPage();

            var unlock = function () {

                jQuery().confirm(
                    RcmAdminService.config.unlockMessages[type].message,
                    function () {
                        page.setEditingOn(type);
                    },
                    null,
                    RcmAdminService.config.unlockMessages[type].title
                );
            };

            // Add CSS
            elm.addClass('rcmPluginLocked');

            // context menu and double click
            elm.dblclick(unlock);
            //elm.click(unlock);

            jQuery.contextMenu(
                {
                    selector: '[data-rcmPluginInstanceId=' + id + ']',

                    //Here are the right click menu options
                    items: {
                        unlockMe: {
                            name: 'Unlock',
                            icon: 'delete',
                            callback: unlock
                        }
                    }
                }
            );

            RcmAdminService.RcmPluginViewModel.disableLinks(elm, onComplete);
        },

        /**
         * enableEdit
         * @param onComplete
         */
        enableEdit: function (elm, onComplete) {

            var id = RcmAdminService.RcmPluginModel.getId(elm);

            elm.removeClass('rcmPluginLocked');
            elm.unbind('dblclick');

            jQuery.contextMenu('destroy', '[data-rcmPluginInstanceId=' + id + ']');

            RcmAdminService.RcmPluginViewModel.disableLinks(elm, onComplete);
        },

        /**
         * enableEdit
         * @param onComplete
         */
        enableArrange: function (elm, onComplete) {

            elm.prepend("<span class='rcmSortableHandle rcmLayoutEditHelper' title='Move Plugin' />");

            var pullDownMenu = '<span class="rcmContainerMenu rcmLayoutEditHelper" title="Container Menu"><ul><li><a href="#"></a><ul><li><a href="#" class="rcmSiteWidePluginMenuItem">Mark as site-wide</a> </li><li><a href="#" class="rcmDeletePluginMenuItem">Delete Plugin</a> </li></ul></li></ul></span>'
            elm.prepend(pullDownMenu);
            elm.hover(
                function () {
                    jQuery(this).find(".rcmLayoutEditHelper").each(function () {
                        jQuery(this).show();
                    });
                },
                function () {
                    jQuery(this).find(".rcmLayoutEditHelper").each(function () {
                        jQuery(this).hide();
                    })
                }
            );
            elm.find(".rcmDeletePluginMenuItem").click(function (e) {
                me.layoutEditor.deleteConfirm(this);
                e.preventDefault();
            });
            elm.find(".rcmSiteWidePluginMenuItem").click(function (e) {
                me.layoutEditor.makeSiteWide(jQuery(this).parents(".rcmPlugin"));
                e.preventDefault();
            });

            if (typeof onComplete === 'function') {
                onComplete(elm);
            }

        },

        /**
         * disableArrange
         * @param elm
         * @param onComplete
         */
        disableArrange: function (elm, onComplete) {
            // @todo
        },

        /**
         * disableLinks
         */
        disableLinks: function (elm, onComplete) {

            // Disable normal events
            elm.find('*').unbind();
            var donDoIt = function () {
                return false;
            };
            elm.find('button').click(donDoIt);
            elm.find('a').click(donDoIt);
            elm.find('form').submit(donDoIt);

            if (typeof onComplete === 'function') {
                onComplete(elm);
            }
        }
    },

    /**
     * RcmPage
     * @param document
     * @param elm
     * @param onInitted
     * @constructor
     */
    RcmPage: function (elm, onInitted) {

        var self = this;
        self.model = RcmAdminService.RcmPageModel;
        self.containerModel = RcmAdminService.RcmContainerModel;
        self.pluginModel = RcmAdminService.RcmPluginModel;

        self.events = RcmAdminService.RcmEventManager;
        self.editing = []; // page, layout, sitewide
        self.editMode = false;

        self.containers = {};
        self.plugins = {};

        /**
         * setEditingOn
         * @param type
         * @returns viod
         */
        self.setEditingOn = function (type) {

            if (self.editing.indexOf(type) < 0) {
                self.editing.push(type);
                self.onEditChange();
            }
        };

        /**
         * setEditingOff
         * @param type
         * @returns viod
         */
        self.setEditingOff = function (type) {

            if (self.editing.indexOf(type) > -1) {

                self.editing.splice(
                    self.editing.indexOf(type),
                    1
                )

                self.onEditChange();
            }
        };

        /**
         * onEditChange
         */
        self.onEditChange = function () {

            self.editMode = (self.editing.length > 0);

            self.events.trigger('editingStateChange', {editMode: self.editMode, editing: self.editing});
        };

        /**
         * arrange
         * @param state
         */
        self.arrange = function (state) {

            if (typeof state === 'undefined') {
                // default is on
                state = true;
            }

            self.arrangeMode = (state === true);

            self.events.trigger('arrangeStateChange', self.arrangeMode);
        };

        /**
         * save
         */
        self.save = function (onSaved) {

            self.registerObjects(
                function (page) {
                    var data = self.getData();
                    // loop containers and fire saves... aggregate data and sent to server
                    data.plugins = {};

                    jQuery.each(
                        self.plugins,
                        function (key, plugin) {
                            data.plugins[key] = plugin.getSaveData();
                        }
                    );

                    //console.log(data);
                }
            );
        };

        /**
         * cancel
         */
        self.cancel = function () {

            self.events.trigger('cancel', {page: self});

            window.location = window.location.pathname;
        };

        /**
         * refresh
         */
        self.refresh = function (onComplete) {

            self.registerObjects(
                function (page) {
                    self.events.trigger('refresh', {page: page});
                    if (typeof onComplete === 'function') {
                        onComplete(self);
                    }
                }
            )
        };

        /**
         * getData
         * @returns {*}
         */
        self.getData = function () {

            return self.model.getData();
        };

        /**
         * registerObjects
         * @param onComplete
         */
        self.registerObjects = function (onComplete) {

            var containerElms = self.containerModel.getElms();

            var containerElm = null;
            var containerId = null;

            var pluginElms = [];
            var pluginElm = null;
            var pluginId = null;

            jQuery.each(
                containerElms,
                function (key, value) {

                    containerElm = jQuery(value);
                    containerId = self.containerModel.getId(containerElm);

                    if (!self.containers[containerId]) {

                        self.containers[containerId] = new RcmAdminService.RcmContainer(self, containerId);
                    }

                    pluginElms = self.pluginModel.getElms(containerId);

                    jQuery.each(
                        pluginElms,
                        function (pkey, pvalue) {

                            pluginElm = jQuery(pvalue);
                            pluginId = self.pluginModel.getId(pluginElm);

                            if (!self.plugins[pluginId]) {

                                self.plugins[pluginId] = new RcmAdminService.RcmPlugin(self, pluginId, self.containers[containerId]);
                            }

                            self.plugins[pluginId].container = self.containers[containerId];

                            self.plugins[pluginId].order = pkey;
                        }
                    );
                }
            );

            if (typeof onComplete === 'function') {
                onComplete(self);
            }
        }

        /**
         * init
         * @param onInitted
         */
        self.init = function (onComplete) {

            self.registerObjects(
                function (page) {

                    if (typeof onComplete === 'function') {
                        onComplete(self);
                    }
                }
            );
        };

        self.init(onInitted);
    },

    /**
     * RcmContainer
     * @param page
     * @param elm
     * @constructor
     */
    RcmContainer: function (page, id, onInitted) {

        var self = this;

        self.model = RcmAdminService.RcmContainerModel;

        self.page = page;
        self.id = id;
        self.editMode = false;

        /**
         * getData
         * @returns {*}
         */
        self.getData = function () {

            return self.model.getData(self.id);
        }

        /**
         * canEdit
         * @param editing
         * @returns {boolean}
         */
        self.canEdit = function (editing) {

            return (editing.indexOf(self.getData().type) > -1);
        };

        /**
         * onEditChange
         * @param args
         */
        self.onEditChange = function (args) {

            self.editMode = self.canEdit(args.editing);
        };

        /**
         * init
         */
        self.init = function (onComplete) {

            self.page.events.on('editingStateChange', self.onEditChange);

            if (typeof onComplete === 'function') {
                onComplete(self);
            }
        };

        self.init(onInitted);
    },

    /**
     * RcmPlugin
     * @param page
     * @param id
     * @constructor
     */
    RcmPlugin: function (page, id, container, onInitted) {

        var self = this;

        self.model = RcmAdminService.RcmPluginModel;
        self.viewModel = RcmAdminService.RcmPluginViewModel;
        self.containerModel = RcmAdminService.RcmContainerModel;

        self.page = page;
        self.id = id;

        self.container = container;
        self.order = 0;
        self.editMode = null;
        self.pluginObject = null;

        /**
         * getType
         * @returns string
         */
        self.getType = function () {

            if (self.getData().isSitewide) {
                return 'sitewide';
            }

            return self.container.getData().type;
        };

        /**
         * getElm
         * @returns {*}
         */
        self.getElm = function () {

            var elm = self.model.getElm(self.container.id, self.id);

            return elm;
        };

        /**
         * getId
         * @returns {*}
         */
        self.getId = function () {

            return self.id;
        };

        /**
         * getName
         * @returns {*|string}
         */
        self.getName = function () {

            var pluginElm = self.getElm();

            return self.model.getName(pluginElm);
        };

        /**
         * getData
         * @returns {*}
         */
        self.getData = function () {

            var data = self.model.getData(self.container.id, self.id);

            data.rank = self.order;

            return data;
        };

        /**
         * getEditorData
         * @returns {{}}
         */
        self.getEditorData = function () {

            var editors = self.getEditorElms();

            var data = {};

            jQuery.each(
                editors,
                function (key, elm) {
                    data[key] = jQuery(elm).html();
                }
            );

            return data;
        };

        /**
         * getSaveData
         * @param onSaved
         */
        self.getSaveData = function (onComplete) {

            var data = self.getData();

            var pluginObject = self.getPluginObject();

            if (pluginObject.getSaveData) {

                var saveData = pluginObject.getSaveData();

                data.saveData = saveData;
            }

            data.editorData = self.getEditorData();

            if (typeof onComplete === 'function') {
                onComplete(self);
            }

            return data;
        };

        /**
         * getPluginObject
         * @returns RcmPluginEditJs
         */
        self.getPluginObject = function () {

            if (self.pluginObject) {

                return self.pluginObject;
            }

            var pluginElm = self.getElm();

            var name = self.model.getName(pluginElm);

            var id = self.model.getId(pluginElm);
            var pluginContainer = self.model.getPluginContainer(pluginElm);

            if (name && id && pluginContainer) {

                var className = name + 'Edit';
                var editClass = window[className];

                if (editClass) {
                    // first child of plugin
                    self.pluginObject = new editClass(id, pluginContainer, self);
                    return self.pluginObject;
                }
            }

            self.pluginObject = new RcmAdminService.RcmPluginEditJs(id, pluginContainer, name);

            return self.pluginObject;
        };

        /**
         * getEditorElms
         * @returns {*}
         */
        self.getEditorElms = function () {

            return self.model.getEditorElms(self.container.id, self.id);
        };

        /**
         * prepareEditors
         * @param onComplete
         */
        self.prepareEditors = function (onComplete) {

            var editors = self.getEditorElms();

            jQuery.each(
                editors,
                function (index, value) {
                    value.setAttribute('html-editor-plugin-id', self.id);
                }
            );

            if (typeof onComplete === 'function') {
                onComplete(self);
            }
        };

        /**
         * canEdit
         * @returns boolean
         */
        self.canEdit = function () {

            var editing = self.page.editing;

            var type = self.getType();

            return (editing.indexOf(type) > -1);
        };

        /**
         * initEdit
         * @param onInitted
         */
        self.initEdit = function (onInitted) {

            var pluginObject = self.getPluginObject()

            self.viewModel.enableEdit(
                self.getElm(),
                function (elm) {
                    if (pluginObject.initEdit) {

                        pluginObject.initEdit();
                    }

                    self.pluginReady();

                    if (typeof onInitted === 'function') {
                        onInitted(self);
                    }
                }
            );
        };

        /**
         * cancelEdit
         * @param onCanceled
         */
        self.cancelEdit = function (onCanceled) {

            self.viewModel.disableEdit(
                self.getElm(),
                self.getType(),
                function (elm) {
                    if (typeof onCanceled === 'function') {
                        onCanceled(self);
                    }
                }
            );
        };

        /**
         * updateView
         * @param onComplete
         */
        self.updateView = function (onComplete) {

            self.pluginReady(onComplete);
        };

        /**
         * pluginReady - trigger post plugin ready actions/ DOM parsing
         */
        self.pluginReady = function (onComplete) {

            self.prepareEditors(
                function (plugin) {

                    RcmAdminService.angularCompile(self.getElm());

                    self.page.events.trigger('pluginReady:' + self.id, self);

                    if (typeof onComplete === 'function') {
                        onComplete(plugin);
                    }
                }
            );

        };

        /**
         * onEditChange
         * @param args
         */
        self.onEditChange = function (args) {

            var editMode = self.canEdit(args.editing);

            if (self.editMode !== editMode) {

                self.editMode = editMode;

                if (self.editMode) {

                    self.initEdit();

                } else {

                    self.cancelEdit();
                }
            }
        };

        /**
         * onArrangeStateChange
         * @param state
         */
        self.onArrangeStateChange = function (state) {

            if (state) {
                self.viewModel.enableArrange(
                    self.getElm()
                );
            } else {
                self.viewModel.disableArrange(
                    self.getElm()
                );
            }
        };

        /**
         * init
         */
        self.init = function (onComplete) {

            self.page.events.on('editingStateChange', self.onEditChange);

            self.page.events.on('arrangeStateChange', self.onArrangeStateChange);

            self.prepareEditors(
                function (plugin) {
                    // @todo - initial state triggers
                    if (typeof onComplete === 'function') {
                        onComplete(plugin);
                    }
                }
            );
        };

        self.init(onInitted);
    },

    /**
     * Default Edit JS - does nothing - interface
     * @param id
     * @param pluginContainer
     * @constructor
     */
    RcmPluginEditJs: function (id, pluginContainer, name) {

        var self = this;
        self.id = id;
        //self.pluginContainer = pluginContainer;

        self.initEdit = function () {
            //console.warn('initEdit: no edit js object found for '+name+' - using default for: ' + self.id);
        };

        self.getSaveData = function () {
            //console.warn('getSaveData: no edit js object found '+name+' - using default for: ' + self.id);
            return {};
        };
    }
};
/* </RcmAdminService> */

rcm.addAngularModule('rcmAdmin');
