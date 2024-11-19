/* eslint-disable @typescript-eslint/no-explicit-any */
import app from "./app";
import config from "./app/config";
import mongoose from "mongoose";
import { Server, createServer } from "http";
import seedAdminAndCSR from "./app/DB";
import initializeSocketIO from "./socket";
//main().catch((err) => console.log(err));

let server: Server;
export let io: any;
async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    seedAdminAndCSR();

    // Create an HTTP server using the Express app
    const httpServer = createServer(app);

    // Initialize Socket.IO on the same HTTP server
    io = initializeSocketIO(httpServer);
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });

    // Start the Socket.IO server
    io.listen(config.socket_port);
    console.log(`Socket.IO server listening on port ${config.socket_port}`);
  } catch (error) {
    console.log(error);
  }
}

main();

process.on("unhandledRejection", (error) => {
  console.log(error);
  console.log("unhandledRejection detected server shutting down 😈");

  if (server) {
    server.close(() => process.exit(1));
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log("uncaughtException detected server shutting down 😈");
  process.exit(1);
});
