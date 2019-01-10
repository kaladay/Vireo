describe('controller: AdvisorSubmissionReviewController', function () {

    var controller, q, scope;

    var initializeController = function(settings) {
        inject(function ($controller, $q, $rootScope, $window, _AdvisorSubmissionRepo_, _ModalService_, _RestApi_, _StorageService_, _WsApi_) {
            installPromiseMatchers();
            scope = $rootScope.$new();

            q = $q;

            sessionStorage.role = settings && settings.role ? settings.role : "ROLE_ADMIN";
            sessionStorage.token = settings && settings.token ? settings.token : "faketoken";

            controller = $controller('AdvisorSubmissionReviewController', {
                $scope: scope,
                $window: $window,
                AdvisorSubmissionRepo: _AdvisorSubmissionRepo_,
                ModalService: _ModalService_,
                RestApi: _RestApi_,
                StorageService: _StorageService_,
                Submission: mockParameterModel(q, mockSubmission),
                WsApi: _WsApi_
            });

            // ensure that the isReady() is called.
            if (!scope.$$phase) {
                scope.$digest();
            }
        });
    };

    beforeEach(function() {
        module('core');
        module('vireo');
        module('mock.advisorSubmissionRepo');
        module('mock.modalService');
        module('mock.restApi');
        module('mock.storageService');
        module('mock.submission');
        module('mock.wsApi');

        installPromiseMatchers();
        initializeController();
    });

    describe('Is the controller defined', function () {
        it('should be defined', function () {
            expect(controller).toBeDefined();
        });
    });
});
