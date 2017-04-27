# Swagger Param Validator

Validates requests based on a given swagger doc

##Example Usage

```
const swagger = require('./my-swagger.json')
const sanitizer=require('swagger-param-sanitizer')(swagger)
const validator=require('swagger-param-validator')(swagger)
const express = require('express')
const app = express()
app.post('/api/doSomething',sanitizer,validator.validateAsMiddleware,(req,res)=>{
res.send('if you've gotten this far, your post was valid')
})
```