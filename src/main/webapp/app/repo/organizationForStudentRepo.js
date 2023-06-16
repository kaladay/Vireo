vireo.repo("OrganizationForStudentRepo", function OrganizationForStudentRepo($q, Organization, RestApi, WsApi) {

    var OrganizationForStudentRepo = this;

    var selectedId;

    var defer;

    this.getSelectedId = function () {
        return selectedId;
    };

    this.setSelectedOrganization = function (organization) {
        selectedId = (organization === undefined) ? undefined : organization.id;
    };

    this.getAllTree = function () {
        return $q(function (resolve, reject) {
            WsApi.fetch(this.mapping.allTree).then(function (res) {
                var apiRes = angular.fromJson(res.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var keys = Object.keys(apiRes.payload);
                    var regex = /^ArrayList\b/;

                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].match(regex)) {
                          resolve(apiRes.payload[keys[i]]);
                          return;
                        }
                    }
                }

                reject();
            });
        }.bind(this));
    };

    this.reset = function () {
        defer = this.getAllTree();

        return defer.promise;
    };

    this.defer = function () {
        if (defer === undefined) {
            defer = this.getAllTree();
        }

        return defer;
    };

    this.ready = function () {
        return this.defer().promise;
    };

    return this;

});
