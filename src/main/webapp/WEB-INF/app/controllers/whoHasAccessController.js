vireo.controller("WhoHasAccessController", function ($controller, $q, $scope, User, UserRepo) {
	angular.extend(this, $controller("AbstractController", {$scope: $scope}));

    $scope.modalData = {};

    $scope.user = User.get();
    
    $scope.userRepo = UserRepo.get();
    
    $scope.ready = $q.all([User.ready(), UserRepo.ready()]);

    $scope.roles = {'ROLE_ADMIN'   : 'Admin'   ,
                    'ROLE_MANAGER' : 'Manager' ,
                    'ROLE_REVIEWER': 'Reviewer',
                    'ROLE_STUDENT' : 'Student'};

    $scope.ready.then(function() {

      // $scope.search = function(user){
      //   if (!$scope.multiFilter
      //       || (user.firstName.toLowerCase().indexOf($scope.multiFilter.toLowerCase()) != -1)
      //       || (user.lastName.toLowerCase().indexOf($scope.multiFilter.toLowerCase()) != -1)
      //       || (user.email.toLowerCase().indexOf($scope.multiFilter.toLowerCase()) != -1) ){
      //       return true;
      //     }
      //     return false;
      //   };
    
        $scope.updateRole = function(userToEdit, newRole) {
            UserRepo.updateRole($scope.user, userToEdit.email, newRole);
        };


        $scope.addSelectedUser = function () {
          UserRepo.addAccess($scope.modalData).then(function() {
            //TODO: ensure list of users is being updated from broadcast
          });
        }

        $scope.setSelectedUser = function (selectedUser) {
            $scope.modalData = selectedUser;
        }
   
    });

});
