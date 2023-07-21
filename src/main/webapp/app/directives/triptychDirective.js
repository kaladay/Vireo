vireo.directive("triptych", function () {
    return {
        templateUrl: 'views/directives/triptych.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        controller: function ($controller, $q, $scope, $timeout, Organization, OrganizationRepo) {

            angular.extend(this, $controller('AbstractController', {
                $scope: $scope
            }));

            $scope.navigation = {
                expanded: true,
                backward: false,
                defer: undefined,
                panels: []
            };

            // Extending organization breaks new submission but is needed for admin settings to work. @fixme the comment may be out of date, and if so then remove this special handling of triptych-type entirely.
            var extendOrganization = !!$scope.attr && !!$scope.attr.triptychType && $scope.attr.triptychType == 'organization' ? true : false;

            console.log("DEBUG: scope=", $scope, ", this=", this, ", extendOrganization=", extendOrganization);

            var refreshPanelMutexLock = false;

            var create = function (organization) {
                var panel = {
                    organization: organization,
                    visible: false,
                    opening: false,
                    closing: false,
                    active: false,
                    previouslyActive: false,
                    filter: '',
                    categories: []
                };
                setCategories(panel);
                return panel;
            };

            var setOrganization = function (panel, organization) {
                if (!organization.loaded) {
                    organization = new Organization(organization);
                }

                if (extendOrganization) {
                    angular.extend(panel.organization, organization);
                } else {
                    panel.organization = organization;
                }

                setCategories(panel);
            };

            var setCategories = function (panel) {
                panel.categories.length = 0;
                for (var i in panel.organization.childrenOrganizations) {
                    if (panel.categories.indexOf(panel.organization.childrenOrganizations[i].category.name) < 0) {
                        panel.categories.push(panel.organization.childrenOrganizations[i].category.name);
                    }
                }
            };

            var add = function (panel) {
                for (var i in $scope.navigation.panels) {
                    if ($scope.navigation.panels[i].organization.id === panel.organization.id) {
                        angular.extend($scope.navigation.panels[i], panel);
                        return $scope.navigation.panels[i];
                    }
                }
                $scope.navigation.panels.push(panel);
                return panel;
            };

            var remove = function (panel) {
                for (var i in $scope.navigation.panels) {
                    if ($scope.navigation.panels[i].organization.id === panel.organization.id) {
                        $scope.navigation.panels.splice(i, 1);
                        break;
                    }
                }
            };

            var open = function (panel, promise) {
                var action = function (panel) {
                    panel.visible = true;
                    $timeout(function () {
                        panel.opening = true;
                        panel.visible = true;
                        $timeout(function () {
                            panel.opening = false;
                            $scope.navigation.backward = false;
                        }, 355);
                    });
                };
                if (promise !== undefined) {
                    promise.then(function () {
                        action(panel);
                    });
                } else {
                    action(panel);
                }
            };

            var close = function (panel) {
                var defer = $q.defer();
                $timeout(function () {
                    panel.closing = true;
                    $timeout(function () {
                        panel.closing = false;
                        panel.visible = false;
                        defer.resolve();
                    }, 355);
                });
                return defer.promise;
            };

            var getPanel = function (organization) {
                return add(create(organization));
            };

            var clear = function (panel) {
                panel.visible = false;
                delete panel.selected;
            };

            $scope.selectOrganization = function (organization) {
                if ($scope.setDeleteDisabled !== undefined) {
                    $scope.setDeleteDisabled();
                }

                if (!!OrganizationRepo.selectedOrganization() && !!OrganizationRepo.selectedOrganization().id && (organization.id !== OrganizationRepo.selectedOrganization().id || OrganizationRepo.selectedOrganization().id === $scope.getOrganizations()[0].id)) {
                    var parent;
                    for (var i = $scope.navigation.panels.length - 1; i >= 0; i--) {
                        var panel1 = $scope.navigation.panels[i];
                        if (parent === undefined) {
                            if (panel1.organization.id === organization.parentOrganization) {
                                parent = panel1;
                            } else {
                                clear(panel1);
                                panel1.active = false;
                                panel1.previouslyActive = false;
                            }
                        } else {
                            panel1.active = false;
                            panel1.previouslyActive = true;
                        }
                    }
                    var panel2 = getPanel(organization);
                    if (parent !== undefined) {
                        if (parent.previouslyActive) {
                            $scope.navigation.backward = true;
                        }
                        parent.active = true;
                        parent.previouslyActive = false;
                        parent.selected = panel2;
                        panel2.parent = parent;
                    }
                    setVisibility(panel2);
                }

                $scope.setSelectedOrganization(organization);
            };

            $scope.refreshPanels = function () {
                var newVisiblePanel;

                for (var i in $scope.navigation.panels) {
                    var panel = $scope.navigation.panels[i];
                    var selectedOrg = OrganizationRepo.selectedOrganization();
                    var specific = (!!selectedOrg && selectedOrg.id == panel.organization.id) ? null : 'shallow';
                    var updatedOrganization = !!panel.organization && !!panel.organization.id ? $scope.findOrganizationById(panel.organization.id, false, specific) : undefined;
                    if (updatedOrganization !== undefined && updatedOrganization !== false && !!updatedOrganization.id) {
                        setOrganization(panel, updatedOrganization);
                        if (panel.organization.childrenOrganizations.length === 0) {
                            clear(panel);
                        } else if (!!selectedOrg && !!selectedOrg.id && selectedOrg.id !== 1) {
                            newVisiblePanel = panel;
                        }
                    } else {
                        if (panel.parent !== undefined) {
                            $scope.selectOrganization(panel.parent.organization);
                        }
                        remove(panel);
                    }
                }
                if (newVisiblePanel !== undefined) {
                    setVisibility(newVisiblePanel);
                }
            };

            var setVisibility = function (panel) {
                var closingPromise;
                var visible = panel.organization &&
                    panel.organization.childrenOrganizations &&
                    panel.organization.childrenOrganizations.length > 0;
                if (panel.visible && !visible) {
                    closingPromise = close(panel);
                }
                if (panel.parent !== undefined) {
                    if (panel.parent.parent !== undefined) {
                        if (panel.parent.parent.parent !== undefined) {
                            if (panel.parent.parent.parent.visible) {
                                if (visible) {
                                    closingPromise = close(panel.parent.parent.parent);
                                }
                            } else {
                                if (!visible) {
                                    open(panel.parent.parent.parent, closingPromise);
                                }
                            }
                        }
                        if (!panel.parent.parent.visible) {
                            open(panel.parent.parent, closingPromise);
                        }
                    }
                    if (!panel.parent.visible) {
                        open(panel.parent, closingPromise);
                    }
                }
                if (panel.parent ? (panel.parent.selected !== undefined && panel.parent.selected.organization.id === panel.organization.id) && !panel.visible && visible : !panel.visible && visible) {
                    open(panel, closingPromise);
                }
            };

            $scope.getBreadcrumbs = function () {
                var breadcrumbs = [];
                for (var i in $scope.navigation.panels) {
                    var panel = $scope.navigation.panels[i];
                    if (panel.visible) {
                        return breadcrumbs;
                    }
                    if (panel.previouslyActive && panel.selected !== undefined) {
                        breadcrumbs.push(panel);
                    }
                }
            };

            OrganizationRepo.defer().then(function (orgs) {
                OrganizationRepo.listen(function (res) {
                    if (!refreshPanelMutexLock) {
                        refreshPanelMutexLock = true;

                        var attemptReload = function() {
                            console.log("DEBUG: attempting reload, busy =", OrganizationRepo.busy());
                            if (OrganizationRepo.busy()) {
                                $timeout(function () {
                                    attemptReload();
                                }, 100);
                            } else {
                                console.log("DEBUG: reloading, busy =", OrganizationRepo.busy());
                                $scope.reloadOrganization('shallow');

                                $timeout(function () {
                                    console.log("DEBUG: refreshing panels inside timeout.");

                                    $scope.refreshPanels();
                                    refreshPanelMutexLock = false;
                                }, 250);
                            }
                        };

                        attemptReload();
                    }
                });
            }).catch(function(reason) {
              console.log("DEBUG: (failure) OrganizationRepo.defer()", reason);
            });
        },
        link: function ($scope, element, attr) {
            $scope.attr = attr;
        }
    };
});
