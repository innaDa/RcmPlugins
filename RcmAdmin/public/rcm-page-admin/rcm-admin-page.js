/**
 * RcmAdminPage AKA RcmPage
 * @param document
 * @param elm
 * @param onInitted
 * @constructor
 */
var RcmAdminPage = function (elm, onInitted, rcmAdminService) {

    var self = this;
    self.model = rcmAdminService.model.RcmPageModel;
    self.containerModel = rcmAdminService.model.RcmContainerModel;
    self.pluginModel = rcmAdminService.model.RcmPluginModel;

    self.loadingMessages = rcmAdminService.config.loadingMessages;
    self.saveUrl = rcmAdminService.config.saveUrl;

    self.events = rcmAdminService.rcmEventManager;
    self.editing = []; // page, layout, sitewide
    self.editMode = false;
    self.arrangeMode = false;

    self.containers = {};
    self.plugins = {};

    self.loading = 0;
    self.loadingMessage = null;

    /**
     * setLoading
     * @param loading
     * @todo This can possibly use the RcmLoading service
     */
    self.setLoading = function (loading, loadingMessage) {

        if (loading) {

            self.loading++;

            if (!self.loadingMessage) {
                self.loadingMessage = self.loadingMessages._default;
            }

            if (!self.loadingMessage.title) {
                self.loadingMessage.title = self.loadingMessages._default.title;
            }

            if (!self.loadingMessage.message) {
                self.loadingMessage.message = self.loadingMessages._default.message;
            }

        } else {

            if (self.loading > 0) {
                self.loading--;
            }
        }

        self.events.trigger(
            'loadingStateChange', {
                loading: self.loading,
                loadingMessage: self.loadingMessage
            }
        );
    };

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
            );

            self.onEditChange();
        }
    };

    /**
     * onEditChange
     */
    self.onEditChange = function () {

        self.editMode = (self.editing.length > 0);

        self.events.trigger('editingStateChange', self);
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
    self.save = function () {

        self.registerObjects(
            function (page) {

                self.setLoading(
                    true,
                    self.loadingMessages.save
                );
                var pagedata = self.getData();

                var data = pagedata.page;

                // loop containers and fire saves... aggregate data and sent to server
                data.plugins = {};

                jQuery.each(
                    self.plugins,
                    function (key, plugin) {
                        data.plugins[key] = plugin.getSaveData();
                    }
                );

                jQuery.post(
                    self.saveUrl + '/' + data.type + '/' + data.name + '/' + data.revision,
                    data,
                    function (msg) {
                        self.setLoading(false);
                        //self.events.trigger('alert', {type:'success',message: 'Page saved'});
                        if (msg.redirect) {
                            window.location = msg.redirect;
                        } else {

                            self.events.trigger(
                                'alert', {
                                    type: 'warning',
                                    message: msg
                                }
                            );
                        }

                    },
                    'json'
                ).fail(
                    function (msg) {
                        self.setLoading(false);
                        self.events.trigger(
                            'alert', {
                                type: 'warning',
                                message: msg
                            }
                        );
                    }
                );
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
     * getPlugin
     * @param pluginId
     * @returns {*}
     */
    self.getPlugin = function (pluginId) {
        if (self.plugins[pluginId]) {
            return self.plugins[pluginId];
        }

        return null;
    };

    /**
     * addPlugin
     * @param containerId
     * @param pluginId
     */
    self.addPlugin = function (containerId, pluginId) {

        if (!self.plugins[pluginId]) {

            self.plugins[pluginId] = new RcmAdminPlugin(
                self,
                pluginId,
                self.containers[containerId],
                rcmAdminService
            );

            self.plugins[pluginId].init();
        }

        self.plugins[pluginId].container = self.containers[containerId];

        self.events.trigger('addPlugin', pluginId);

        return self.plugins[pluginId];
    };

    /**
     * removePlugin
     * @param containerId
     * @param pluginId
     */
    self.removePlugin = function (pluginId) {

        if (self.plugins[pluginId]) {

            self.plugins[pluginId].remove(
                function (plugin) {
                    delete(self.plugins[pluginId]);
                    self.events.trigger('removePlugin', pluginId);
                }
            );
        }
    };

    /**
     * registerObjects
     * - Update object list based on DOM state
     * - should be called after DOM update
     * @param onComplete
     */
    self.registerObjects = function (onComplete) {

        var containerElms = self.containerModel.getElms();

        var containerElm = null;
        var containerId = null;

        var pluginsRemove = [];
        var pluginElms = [];
        var pluginElm = null;
        var pluginId = null;

        jQuery.each(
            containerElms,
            function (key, value) {

                containerElm = jQuery(value);
                containerId = self.containerModel.getId(containerElm);

                if (!self.containers[containerId]) {

                    self.containers[containerId] = new RcmAdminContainer(
                        self,
                        containerId,
                        self.containerModel
                    );
                }

                pluginElms = self.pluginModel.getElms(containerId);

                jQuery.each(
                    pluginElms,
                    function (pkey, pvalue) {

                        pluginElm = jQuery(pvalue);
                        pluginId = self.pluginModel.getId(pluginElm);

                        self.addPlugin(containerId, pluginId);

                        pluginsRemove.push(pluginId);
                    }
                );
            }
        );

        // remove if no longer in DOM
        jQuery.each(
            self.plugins,
            function (prkey, prvalue) {
                if (pluginsRemove.indexOf(prvalue.id) < 0) {
                    self.removePlugin(prvalue.id);
                }
            }
        );

        self.events.trigger('registerObjects', self.plugins);

        if (typeof onComplete === 'function') {
            onComplete(self);
        }
    };


    /**
     * init
     * @param onComplete
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
};