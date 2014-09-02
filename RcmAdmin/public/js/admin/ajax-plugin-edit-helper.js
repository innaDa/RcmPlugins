/**
 * <AjaxPluginEditHelper|ajax-plugin-edit-helper>
 * Provides shared ajax editing functionality
 *
 * @constructor
 */
var AjaxPluginEditHelper = function (instanceId, container, pluginUrlName) {

    /**
     * Always refers to this object unlike the 'this' JS variable;
     * @type {RcmDistributorApp}
     */
    var me = this;

    var pluginBaseUrl = '/api/admin/instance-configs/'
        + instanceId;

    /**
     * @deprecated - this is done in the RcmAdminService
     */
    this.disableEvents = function () {

        //Disable normal events
        container.find('*').unbind();
        var donDoIt = function () {
            return false;
        };
        container.find('button').click(donDoIt);
        container.find('a').click(donDoIt);
        container.find('form').submit(donDoIt)
    };

    me.ajaxGetInstanceConfigs = function (callback) {
        container.hide();//Hide while loading to prevent weirdness
        $.getJSON(
            pluginBaseUrl,
            function (result) {
                container.show();
                //window['rcmEdit'].refreshEditors(container);
                rcm.angularCompile(container);
                //result.instanceConfig, result.defaultInstanceConfig
                callback(result.instanceConfig, result.defaultInstanceConfig);
            }
        );
    };

    /**
     * An input group is an array of text inputs, useful for html selects.
     * This function builds an array of input groups.
     * @param groupDataKeyNames
     * @param data
     * @param defaultData
     * @return {Object}
     */
    me.buildInputGroups = function (groupDataKeyNames, data, defaultData) {
        var inputGroups = {};
        $.each(groupDataKeyNames, function () {
            inputGroups[this] = me.buildInputGroup(
                data[this],
                defaultData[this]
            );
        });
        return inputGroups;
    };

    /**
     * An input group is an array of text inputs, useful for html selects.
     * This function transfers the data from html text boxes to the data array
     * @param inputGroups
     * @param data
     * @return {*}
     */
    me.captureInputGroups = function (inputGroups, data) {
        $.each(inputGroups, function (inputGroupName, inputGroup) {
            data = me.captureInputGroup(inputGroupName, inputGroup, data);
        });
        return data;
    };

    /**
     * An input group is an array of text inputs, useful for html selects.
     * This function builds a single input group
     * @param currentTranslations
     * @param defaultTranslations
     * @return {Object}
     */
    me.buildInputGroup = function (currentTranslations, defaultTranslations) {
        var inputs = {};
        $.each(defaultTranslations, function (key, value) {
            inputs[key] = $.dialogIn('text', value, currentTranslations[key]);
        });
        return inputs
    };

    /**
     * An input group is an array of text inputs, useful for html selects.
     * This function transfers the data from html text boxes to the data array
     * @param inputGroupName
     * @param inputGroup
     * @param data
     * @return {*}
     */
    me.captureInputGroup = function (inputGroupName, inputGroup, instanceConfig) {
        $.each(instanceConfig[inputGroupName], function (key) {
            if (inputGroup[key]) {
                instanceConfig[inputGroupName][key] = inputGroup[key].val()
            }
        });
        return instanceConfig;
    };

    me.buildEmailInputGroup = function (emailGroupData) {
        return {
            fromEmail: $.dialogIn('text', 'From Email', emailGroupData['fromEmail']),
            fromName: $.dialogIn('text', 'From Name', emailGroupData['fromName']),
            subject: $.dialogIn('text', 'Subject', emailGroupData['subject']),
            body: $.dialogIn('richEdit', 'Body', emailGroupData['body'])
        };
    };

    this.attachPropertiesDialog = function (showMainPropertiesCallback) {
        //Double clicking will show properties dialog
        container.delegate('div', 'dblclick', function (event) {
            event.stopPropagation();
            showMainPropertiesCallback();
        });

        //Add right click menu
        $.contextMenu({
            selector: rcm.getPluginContainerSelector(instanceId),
            //Here are the right click menu options
            items: {
                edit: {
                    name: 'Edit Properties',
                    icon: 'edit',
                    callback: function () {
                        showMainPropertiesCallback();
                    }
                }

            }
        });
    }
};
/* </AjaxPluginEditHelper|ajax-plugin-edit-helper> */