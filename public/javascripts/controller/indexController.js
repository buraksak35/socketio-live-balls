app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.messages = [];
    $scope.players = {};

    $scope.init = () => {
      const username = prompt("Please enter a username");

      if (username) initSocket(username);
      else return false;
    };

    function scrollTop() {
      setTimeout(() => {
        const element = document.getElementById("chat-area");

        element.scrollTop = element.scrollHeight;
      });
    }

    function showToBubble(id, message) {
      $("#" + id)
        .find(".message")
        .show()
        .html(message);

      setTimeout(() => {
        $("#" + id)
          .find(".message")
          .hide();
      }, 2000);
    }

    async function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600
      };

      try {
        const socket = await indexFactory.connectSocket("http://localhost:3000", connectionOptions);

        socket.on("init-players", players => {
          $scope.players = players;
          $scope.$apply();
        });

        socket.emit("new-user", { username });

        socket.on("new-user", data => {
          const messageData = {
            type: {
              code: 0, // info or user message,
              message: 1 // connect or disconnect
            },
            username: data.username
          };

          $scope.messages.push(messageData);
          $scope.players[data.id] = data;

          scrollTop();

          $scope.$apply();
        });

        socket.on("disconnect-user", user => {
          const messageData = {
            type: {
              code: 0, // info or user message,
              message: 0 // connect or disconnect
            },
            username: user.username
          };

          $scope.messages.push(messageData);
          delete $scope.players[user.id];

          scrollTop();

          $scope.$apply();
        });

        socket.on("animate", data => {
          $("#" + data.socketId).animate({ left: data.x, top: data.y }, () => {
            animate = false;
          });
        });

        socket.on("new-message", data => {
          $scope.messages.push(data);

          $scope.$apply();

          showToBubble(data.socketId, data.text);

          scrollTop();
        });

        let animate = false;

        if (!animate) {
          $scope.onClickPLayer = $event => {
            let x = $event.offsetX;
            let y = $event.offsetY;

            socket.emit("animate", { x, y });

            animate = true;
            $("#" + socket.id).animate({ left: x, top: y }, () => {
              animate = false;
            });
          };
        }

        $scope.newMessage = () => {
          let message = $scope.message;

          const messageData = {
            type: {
              code: 1 // info or user message,
            },
            username: username,
            text: message
          };

          $scope.messages.push(messageData);

          $scope.message = "";

          socket.emit("new-message", messageData);

          showToBubble(socket.id, message);

          scrollTop();
        };
      } catch (error) {
        console.log(error);
      }
    }
  }
]);
