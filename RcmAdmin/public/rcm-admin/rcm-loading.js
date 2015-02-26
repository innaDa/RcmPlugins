var RcmLoading = function (onloadingStart, onloadingEnd) {

    var self = this;

    // var onloadingStart = function(data){}
    // var onloadingEnd = function(data){}

    self.loading = [];

    self.startLoading = function (namespace, id) {

        if (!namespace || !id) {
            // console.warn('RcmLoading requires unique namespace and id to track loading state'.);
            return;
        }
        if (!self.loading[namespace]) {

            self.loading[namespace] = [];
        }

        var firstLoading = false;

        if (self.loading[namespace].length == 0) {

            firstLoading = true;
        }

        if (self.loading[namespace].indexOf(id) < 0) {

            self.loading[namespace].push(id);

            if (firstLoading) {

                onloadingStart(
                    {
                        id: id,
                        loading: self.loading,
                        namespace: namespace
                    }
                );
            }

        }
    };
    self.endLoading = function (namespace, id) {

        if (!namespace || !id) {
            // console.warn('RcmLoading requires unique namespace and id to track loading state'.);
            return;
        }

        if (!self.loading[namespace]) {

            self.loading[namespace] = [];
        }

        var index = self.loading[namespace].indexOf(id);

        if (index > -1) {

            self.loading[namespace].splice(
                index,
                1
            );

            if (self.loading[namespace].length < 1) {

                onloadingEnd(
                    {
                        id: id,
                        loading: self.loading,
                        namespace: namespace
                    }
                );
            }
        }
    };
    /**
     *
     * @param namespace
     * @param id
     * @returns {boolean}
     */
    self.isLoading = function (namespace, id) {

        if (!namespace) {

            for (var i in self.loading) {
                if (self.loading[i] > 0) {
                    return true;
                }

                return false;
            }
        }

        if (!self.loading[namespace]) {
            return false;
        }

        if (!id) {

            return (self.loading[namespace].indexOf(id) > -1);
        }

        return (self.loading[namespace].length > 0)
    };
};
