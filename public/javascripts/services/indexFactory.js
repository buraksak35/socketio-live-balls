// Angular Service

app.factory("indexFactory", [
  () => {
    const connectSocket = (url, options) => {
      return new Promise((resolve, reject) => {
        const socket = io.connect(url, options);

        socket.on("connect", () => {
          resolve(socket);
        });

        socket.on("connect_error", () => {
          resolve(new Error("socket connection error"));
        });
      });
    };

    return {
      connectSocket
    };
  }
]);
