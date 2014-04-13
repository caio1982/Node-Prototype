Node-Prototype
==============

Boilerplate project in Node.js for a REST API with Bcrypt authentication and Mongo support. Using:

- bcrypt (crendentials encryption)
- passport (authentication)
- passport-http (basic auth strategy)
- winston (logging)
- express (web framework)
- express-load (simple mvc)
- mongoose (mongodb support)
- mongoose-validator (basic db validations)

Usage
-----

This is all boilerplate code and should not be used as is. If you still wanna try it, `npm install nodemon` and run it either through `nodemon server.js` or `node server.js` directly. Logs will be saved to `server.log` as well.

TODO
----

- Dual crypto support with scrypt
- Jade templates? It's backend code but...
- Alternative auth strategies for Passport
- Custom DB validators
