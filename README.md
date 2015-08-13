## Websocket example with protocol buffers and Typescript

#### Instructions

To start server, issue

    cd backend
    mvn jetty:run

To start client, issue

    cd client
    gulp run


#### Notes

* A version with no Typescript (regular Javascript) is at <https://github.com/aliok/websocket-protobufs-experiments>
* Protocol buffer definitions are in `definitions` folder. Both backend and client uses it from there.
* Union types technique is employed in proto file. This is because I needed more than one command type.
  See <https://developers.google.com/protocol-buffers/docs/techniques?csw=1#union>

* TBA: proto3 ==> get rid of union types
  * This is to be done if protobuf.js and the TypeScript thing supports proto3
