/**
 * Angular JS module used to shoe HTML editor and toolbar on a page
 * @require:
 *  AngularJS
 *  TinyMce
 */
angular.module('RcmHtmlEditor', [])

    .factory(
    'rcmHtmlEditorConfig',
    function () {

        var self = this;

        self.language = 'en';
        self.baseUrl = "/"; //"<?php echo $baseUrl; ?>";
        self.fixed_toolbar_container = '#externalToolbarWrapper';
        self.toolbar_container_prefix = '#htmlEditorToolbar-';

        self.htmlEditorOptions = {
            defaults: {
                optionsName: 'defaults',
                force_br_newlines: false,
                force_p_newlines: false,
                forced_root_block: '',

                inline: true,
                fixed_toolbar_container: self.fixed_toolbar_container,
                language: self.language,

                menubar: false,
                plugins: "anchor, charmap, code, hr, image, link, paste, table, textcolor, colorpicker",
                relative_urls: true,
                document_base_url: self.baseUrl,
                statusbar: false,

                toolbar: [
                    "code | undo redo | styleselect | forecolor | " +
                        "bold italic underline strikethrough subscript superscript removeformat | " +
                        "alignleft aligncenter alignright alignjustify | " +
                        "bullist numlist outdent indent | cut copy pastetext | " +
                        "image table hr charmap | link unlink anchor"
                ]
            },
            text: {
                optionsName: 'text',
                force_br_newlines: false,
                force_p_newlines: false,
                forced_root_block: '',

                inline: true,
                fixed_toolbar_container: self.fixed_toolbar_container,
                language: self.language,

                menubar: false,
                plugins: "anchor, charmap, code, hr, image, link, paste, table, textcolor, colorpicker",
                relative_urls: true,
                document_base_url: self.baseUrl,
                statusbar: false,

                toolbar: [
                    "code | undo redo | forecolor | " +
                        "bold italic underline strikethrough subscript superscript removeformat | " +
                        "outdent indent | cut copy pastetext | " +
                        "image charmap | link unlink anchor"
                ]
            },
            simpleText: {
                optionsName: 'simpleText',
                force_br_newlines: false,
                force_p_newlines: false,
                forced_root_block: '',

                inline: true,
                fixed_toolbar_container: self.fixed_toolbar_container,
                language: self.language,

                menubar: false,
                plugins: "anchor, charmap, code, hr, image, link, paste, table",
                relative_urls: true,
                document_base_url: self.baseUrl,
                statusbar: false,

                toolbar: [
                    "code | " +
                        "bold italic underline strikethrough subscript superscript removeformat | " +
                        "link unlink anchor"
                ]
            }
        }

        return self;
    }
)
    .factory(
        'rcmHtmlEditorState',
        [
            function () {

                var RcmHtmlEditorState = function () {

                    var self = this;
                    self.isEditing = false;
                    self.toolbarLoading = false;
                    self.editorsLoading = [];
                    self.showFixedToolbar = false;
                    self.editors = {};
                    self.hasEditors = false;

                    self.updateState = function (onUpdateComplete) {

                        var hasEditors = false;

                        for (var id in self.editors) {

                            if (self.editors[id].hasTinyMce()) {

                                hasEditors = true;
                            }
                        }

                        self.hasEditors = hasEditors;

                        if (typeof onUpdateComplete === 'function') {

                            onUpdateComplete(self);
                        }
                    }

                    self.deleteEditor = function (id) {

                        delete self.editors[id];
                    }

                    self.hasTinyMce = function (id) {

                        if (self.editors[id]) {

                            return self.editors[id].hasTinyMce();
                        }

                        return false;
                    }

                    self.loading = function (editorId, loading, msg) {

                        if (loading) {

                            if (self.editorsLoading.indexOf(editorId) < 0) {
                                self.editorsLoading.push(editorId);
                            }
                        } else {

                            if (self.editorsLoading.indexOf(editorId) > -1) {

                                self.editorsLoading.splice(
                                    self.editorsLoading.indexOf(editorId),
                                    1
                                )
                            }
                        }

                        self.toolbarLoading = self.editorsLoading.length > 0;
                    }
                };

                var rcmHtmlEditorState = new RcmHtmlEditorState();

                return rcmHtmlEditorState;
            }
        ]
    )
    .factory(
        'htmlEditorOptions',
        [
            'rcmHtmlEditorConfig',
            function (rcmHtmlEditorConfig) {

                var self = this;

                // get options based on the config settings
                self.getHtmlOptions = function (type) {

                    if (!type) {

                        return rcmHtmlEditorConfig.htmlEditorOptions.defaults;
                    }

                    if (rcmHtmlEditorConfig.htmlEditorOptions[type]) {

                        return rcmHtmlEditorConfig.htmlEditorOptions[type]
                    }

                    return rcmHtmlEditorConfig.htmlEditorOptions.defaults;
                }


                // build settings based on the attrs and config
                self.buildHtmlOptions = function (id, scope, attrs, config) {

                    var options = {};
                    var settings = {};

                    if (typeof config !== 'object') {

                        config = {};
                    }

                    if (attrs.htmlEditorOptions) {
                        try {
                            var attrConfig = scope.$eval(attrs.htmlEditorOptions);
                        } catch (e) {

                        }

                        if (typeof attrConfig === 'object') {

                            config = angular.extend(attrConfig, config);
                        }
                    }

                    options = angular.copy(self.getHtmlOptions(attrs.htmlEditorType));

                    settings = angular.extend(options, config); // copy(options);

                    settings.mode = 'exact';
                    settings.elements = id;
                    settings.fixed_toolbar = true;

                    // set some overrides based on attr html-editor-attached-toolbar
                    if (typeof attrs.htmlEditorAttachedToolbar !== 'undefined') {

                        settings.inline = true;
                        settings.fixed_toolbar_container = rcmHtmlEditorConfig.toolbar_container_prefix + id;
                        settings.fixed_toolbar = false;

                        // @todo NOT SUPPORTED: attr html-editor-show-hide-toolbar
                        //if (typeof attrs.htmlEditorShowHideToolbar !== 'undefined') {
                        //    settings.show_hide_toolbar = true;
                        //}
                    }

                    // set some overrides based on attr html-editor-base-url
                    if (attrs.htmlEditorBaseUrl) {
                        settings.baseUrl = attrs.htmlEditorBaseUrl;
                    }

                    if (attrs.htmlEditorSize) {
                        settings.toolbar_items_size = attrs.htmlEditorSize; // 'small'
                    }

                    return settings
                }

                return self;
            }
        ]
    )
    .factory(
        'guid',
        [
            function () {

                var guid = (function () {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }

                    return function () {
                        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                            s4() + '-' + s4() + s4() + s4();
                    };
                })();

                return guid;
            }
        ]

    )
    .factory(
        'rcmHtmlEditorFactory',
        [
            'RcmHtmlEditor',
            'rcmHtmlEditorState',
            function (RcmHtmlEditor, rcmHtmlEditorState) {

                var self = this;

                self.build = function (id, scope, elm, attrs, ngModel, settings, onBuilt) {

                    rcmHtmlEditorState.editors[id] = new RcmHtmlEditor(id);

                    rcmHtmlEditorState.editors[id].init(
                        scope,
                        elm,
                        attrs,
                        ngModel,
                        settings,
                        onBuilt
                    );
                }

                self.destroy = function (id, onDestroyed) {

                    if (rcmHtmlEditorState.editors[id]) {

                        rcmHtmlEditorState.editors[id].destroy(onDestroyed);
                    }
                }

                return self;
            }
        ]
    )
    .factory(
        'RcmHtmlEditor',
        [
            'rcmHtmlEditorState',
            function (rcmHtmlEditorState) {

                var RcmHtmlEditor = function (id) {
                    var self = this;
                    self.id = id;
                    self.scope;
                    self.elm;
                    self.attrs;
                    self.ngModel;

                    self.settings = {};
                    self.tinyInstance;
                    self.tagName = "";

                    self.init = function (scope, elm, attrs, ngModel, settings, onInitComplete) {

                        self.scope = scope;
                        self.elm = elm;
                        self.ngModel = ngModel;
                        self.settings = settings;
                        self.attrs = attrs;

                        self.buildEditor(onInitComplete);
                    }

                    self.getTagName = function () {

                        if ((self.elm && self.elm[0]) && !self.tagName) {
                            self.tagName = self.elm[0].tagName;
                        }

                        return self.tagName;
                    }

                    self.getElmValue = function () {

                        if (self.isFormControl()) {

                            return self.elm.val();
                        }

                        return self.elm.html();
                    }

                    self.isFormControl = function () {

                        if (self.getTagName() == "TEXTAREA") {

                            return true;
                        }

                        return false;
                    }

                    self.updateView = function () {

                        if (self.ngModel) {
                            self.ngModel.$setViewValue(self.getElmValue());
                        }
                        if (!self.scope.$root.$$phase) {
                            self.scope.$apply();
                        }
                    };

                    self.buildEditor = function (onBuilt) {

                        self.settings.setup = function (ed) {
                            var args;
                            //
                            //ed.on('click', function (args) {
                            //
                            //    if (self.elm.click) {
                            //        self.elm.click();
                            //    }
                            //});
                            ed.on('init', function (args) {

                                if (self.ngModel) {
                                    self.ngModel.$render();
                                    self.ngModel.$setPristine();
                                }

                                rcmHtmlEditorState.updateState(
                                    function () {
                                        rcmHtmlEditorState.loading(self.id, false, 'init');

                                        // will show default toolbar on init
                                        if (ed.settings.fixed_toolbar) {

                                            rcmHtmlEditorState.showFixedToolbar = true;
                                        }

                                        // could cause issue if fires early
                                        if (!self.scope.$root.$$phase) {
                                            self.scope.$apply(
                                                function () {

                                                    if (typeof onBuilt === 'function') {
                                                        onBuilt(self, rcmHtmlEditorState);
                                                    }
                                                }
                                            );
                                        }

                                    }
                                );
                            });
                            //
                            ed.on('postrender', function (args) {
                            });
                            // Update model on button click
                            ed.on('ExecCommand', function (e) {

                                ed.save();
                                self.updateView();
                            });
                            // Update model on keypress
                            ed.on('KeyUp', function (e) {

                                ed.save();
                                self.updateView();
                            });
                            // Update model on change, i.e. copy/pasted text, plugins altering content
                            ed.on('SetContent', function (e) {

                                if (!e.initial) {

                                    if (self.ngModel) {

                                        if (self.ngModel.$viewValue !== e.content) {
                                            ed.save();
                                            self.updateView();
                                        }
                                    } else {

                                        ed.save();
                                        self.updateView();
                                    }
                                }
                            });
                            //
                            ed.on('blur', function (e) {

                                rcmHtmlEditorState.isEditing = false;

                                if (self.elm.blur) {
                                    //causing some issues //
                                    //self.elm.blur();
                                }
                                self.updateView();
                            });
                            //
                            ed.on('focus', function (e) {

                                rcmHtmlEditorState.isEditing = true;

                                if (self.elm.focus) {
                                    //causing some issues //
                                    //self.elm.focus();
                                }
                                self.updateView();
                            });
                            // Update model when an object has been resized (table, image)
                            ed.on('ObjectResized', function (e) {

                                ed.save();
                                self.updateView();
                            });
                            // This might be needed if setup can be passed in
                            //if (settings) {
                            //    settings(ed);
                            //}
                        };

                        setTimeout(function () {

                            tinymce.init(self.settings);
                        });

                        if (self.ngModel) {

                            self.ngModel.$render = function () {

                                if (!self.tinyInstance) {
                                    self.tinyInstance = tinymce.get(self.id);
                                }
                                if (self.tinyInstance) {
                                    self.tinyInstance.setContent(self.ngModel.$viewValue || self.getElmValue());
                                } else {
                                    // self.destroy(null, 'tinyInstance not found')
                                }
                            };
                        }

                        self.elm.on('$destroy', function () {

                            self.destroy(null, 'RcmHtmlEditor.elm.$on($destroy');
                        })

                        self.scope.$on('$destroy', function () {

                            // this can cause issues with editors that are on the page dynamically
                            // might be caused by element being destroyed and scope is part on elm.
                            // self.destroy(null, 'RcmHtmlEditor.scope.$on($destroy)');
                        });
                    };

                    self.destroy = function (onDestroyed, msg) {

                        if (!self.tinyInstance) {
                            self.tinyInstance = tinymce.get(self.id);
                        }
                        if (self.tinyInstance) {
                            self.tinyInstance.remove();
                        }

                        rcmHtmlEditorState.updateState(
                            function (rcmHtmlEditorState) {
                                rcmHtmlEditorState.deleteEditor(id);

                                if (typeof onDestroyed === 'function') {
                                    onDestroyed(rcmHtmlEditorState);
                                }
                            }
                        );
                    }

                    self.hasTinyMce = function () {

                        var tinyInstance = tinymce.get(self.id);

                        if (tinyInstance) {
                            return true;
                        }

                        return false;
                    }
                };

                return RcmHtmlEditor;
            }
        ]
    )
    .factory(
        'rcmHtmlEditorInit',
        [
            'guid',
            'htmlEditorOptions',
            'rcmHtmlEditorState',
            'rcmHtmlEditorFactory',
            function (guid, htmlEditorOptions, rcmHtmlEditorState, rcmHtmlEditorFactory) {

                return function (scope, elm, attrs, ngModel, config) {

                    // generate an ID if not present
                    if (!attrs.id) {
                        attrs.$set('id', guid());
                    }
                    var id = attrs.id;

                    // this is to hide the default toolbar before init
                    rcmHtmlEditorState.loading(id, true, 'rcmHtmlEditorInit');

                    // get settings from attr or config
                    var settings = htmlEditorOptions.buildHtmlOptions(
                        id,
                        scope,
                        attrs,
                        config
                    );

                    var onBuilt = function (rcmHtmlEditor, rcmHtmlEditorState) {

                        rcmHtmlEditorState.loading(id, false, 'rcmHtmlEditorInit.onBuilt: ');
                    }

                    rcmHtmlEditorFactory.build(id, scope, elm, attrs, ngModel, settings, onBuilt);
                }
            }
        ]
    )
    .factory(
        'rcmHtmlEditorDestroy',
        [
            'rcmHtmlEditorState',
            'rcmHtmlEditorFactory',
            function (rcmHtmlEditorState, rcmHtmlEditorFactory) {

                return function (id) {

                    if (id) {

                        var onDestroyed = function (rcmHtmlEditorState) {
                            // clean up loading
                            rcmHtmlEditorState.loading(id, false, 'rcmHtmlEditorDestroy');
                        }

                        rcmHtmlEditorFactory.destroy(id, onDestroyed);
                    }
                }
            }
        ]
    )
    /*
     * rcmHtmlEdit - rcm-html-edit
     *
     * Attributes options:
     *  html-editor-options
     *  html-editor-type
     *  html-editor-attachedToolbar
     *  html-editor-base-url
     *  html-editor-size
     *  id
     */
    .directive(
        'rcmHtmlEdit',
        [
            'rcmHtmlEditorInit',
            function (rcmHtmlEditorInit) {

                var self = this;

                self.compile = function (tElm, tAttr) {
                    return function (scope, elm, attrs, ngModel, config) {
                        rcmHtmlEditorInit(scope, elm, attrs, ngModel, config);
                    }
                }
                return {
                    priority: 10,
                    require: '?ngModel',
                    compile: self.compile
                }
            }
        ]
    )
    /*
     * htmlEditorToolbar - html-editor-toolbar
     * Example:
     * <div html-editor-toolbar></div>
     */
    .directive(
        'htmlEditorToolbar',
        [
            'rcmHtmlEditorState',
            function (rcmHtmlEditorState) {

                var thislink = function (scope, element, attrs, htmlEditorState) {

                    var self = this;

                    scope.rcmHtmlEditorState = rcmHtmlEditorState;
                }

                return {
                    link: thislink,
                    restrict: 'A',
                    templateUrl: 'rcm-html-editor-fake-text.html'
                };
            }
        ]
    )
    .run([
             "$templateCache",
             function ($templateCache) {
                 $templateCache.put(
                     'rcm-html-editor-fake-text.html',
                     '<div class="htmlEditorToolbar" ng-cloak ng-hide="rcmHtmlEditorState.toolbarLoading"><div class="mce-fake" ng-show="rcmHtmlEditorState.showFixedToolbar && !rcmHtmlEditorState.isEditing" ><div class="mce-tinymce mce-tinymce-inline mce-container mce-panel" role="presentation"><div class="mce-container-body mce-abs-layout"><div class="mce-toolbar-grp mce-container mce-panel mce-first mce-last"><div class="mce-container-body mce-stack-layout"><div class="mce-container mce-toolbar mce-first mce-last mce-stack-layout-item"><div class="mce-container-body mce-flow-layout"><div class="mce-container mce-first mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-first mce-last mce-disabled" tabindex="-1" role="button" aria-label="Source code" ><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-code"></i></button></div></div></div><div class="mce-container mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-first mce-disabled" tabindex="-1" aria-labelledby="" role="button" aria-label="Undo" aria-disabled="true"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-undo"></i></button></div><div class="mce-widget mce-btn mce-last mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Redo" aria-disabled="true"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-redo"></i></button></div></div></div><div class="mce-container mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-colorbutton mce-first mce-last mce-disabled" role="button" tabindex="-1" aria-haspopup="true" aria-label="Text color"><button role="presentation" hidefocus="1" type="button" tabindex="-1"><i class="mce-ico mce-i-forecolor"></i><span class="mce-preview"></span></button><button type="button" class="mce-open mce-disabled" hidefocus="1" tabindex="-1"><i class="mce-caret"></i></button></div></div></div><div class="mce-container mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-first mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Bold"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-bold"></i></button></div><div class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Italic"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-italic"></i></button></div><div class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Underline"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-underline"></i></button></div><div class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Strikethrough"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-strikethrough"></i></button></div><div class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Subscript"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-subscript"></i></button></div><div class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Superscript"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-superscript"></i></button></div><div class="mce-widget mce-btn mce-last mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Clear formatting"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-removeformat"></i></button></div></div></div><div class="mce-container mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-first mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Decrease indent"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-outdent"></i></button></div><div class="mce-widget mce-btn mce-last mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Increase indent"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-indent"></i></button></div></div></div><div class="mce-container mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-first mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Cut"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-cut"></i></button></div><div class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Copy"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-copy"></i></button></div><div class="mce-widget mce-btn mce-last mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-pressed="false" aria-label="Paste as text"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-pastetext"></i></button></div></div></div><div class="mce-container mce-flow-layout-item mce-btn-group mce-disabled" role="group"><div><div class="mce-widget mce-btn mce-first mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Insert/edit image"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-image"></i></button></div><div class="mce-widget mce-btn mce-last mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Special character"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-charmap"></i></button></div></div></div><div class="mce-container mce-last mce-flow-layout-item mce-btn-group" role="group"><div><div class="mce-widget mce-btn mce-first mce-disabled" tabindex="-1" aria-labelledby=" " role="button" aria-label="Insert/edit link"><button role="presentation" type="button" tabindex="-1"><i class="mce-ico mce-i-link"></i></button></div><div id="mcefake_21" class="mce-widget mce-btn mce-disabled" tabindex="-1" aria-labelledby="mcefake_21" role="button" aria-label="Remove link"><button role="presentation" type="button" tabindex="-1" ><i class="mce-ico mce-i-unlink"></i></button></div><div id="mcefake_22" class="mce-widget mce-btn mce-last mce-disabled" tabindex="-1" aria-labelledby="mcefake_22" role="button" aria-label="Anchor"><button role="presentation" type="button" tabindex="-1" ><i class="mce-ico mce-i-anchor"></i></button></div></div></div></div></div></div></div></div></div></div><div id="externalToolbarWrapper"></div></div>'

                 );
             }
         ]);