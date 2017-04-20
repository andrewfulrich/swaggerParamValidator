/**
 Swagger Param Parser

 Parses the parameters from a swagger doc and turns them into json schemas so you can validate on them and stuff

 Author: Andrew Ulrich

 MIT License

 Copyright (c) 2017 Andrew F. Ulrich

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * gets the parameters from a swagger doc
 * @param req
 * @param swagger
 * @returns {*}
 */
function getSwaggerParams(req,swagger) {
  let thePath=req.url
  if(req.url.indexOf('?') > -1) {
    thePath=req.url.substr(0,req.url.indexOf('?'))
  }
  if(swagger.basePath && thePath.indexOf(swagger.basePath) > -1 && thePath.length > thePath.indexOf(swagger.basePath)+4) {
    thePath=thePath.substr(thePath.indexOf(swagger.basePath)+4)
  }
  let theMethod=req.method.toLowerCase()

  if(swagger.paths[thePath] == undefined) {
    //then there's probably a path param in thePath preventing it from being matched
    thePath=matchPathWithPathParam(thePath,Object.keys(swagger.paths))
  }
  return swagger.paths[thePath][theMethod].parameters
}

/**
 * matches a given request url with its corresponding swagger path
 * @param reqPath a real request url
 * @param swaggerPaths a list of all the swagger paths in a swagger doc
 * @returns {{text: string, values}|T}
 */
function matchPathWithPathParam(reqPath,swaggerPaths) {
  let reqUrlAsArray=reqPath.split('/')

  return swaggerPaths.find((swaggerPath)=>{
    let pathAsArray=swaggerPath.split('/')

    if(pathAsArray.length != reqUrlAsArray.length) {
      return false;
    }
    let pathArrayReplacedParams=pathAsArray.map((urlDir,index)=>{
      //path params look like {asdf}
      return urlDir.indexOf('{') == 0 ? reqUrlAsArray[index] : urlDir
    })
    return reqPath==pathArrayReplacedParams.join('/')
  })
}

/**
 * converts parrams in a swagger endpoint to a json schema
 * @param parameters
 * @returns {*}
 */
function swaggerParamsToSchema(parameters) {
  let {params,initialSchema}=parseBodyParams(parameters)

  //for the rest of the params, add them to the schema too
  return params.reduce((accumulator,currentValue)=>{
    let schemaObj=Object.keys(currentValue).reduce((a,c)=>{
      if(['name','in','required'].indexOf(c)==-1) {
        a[c]=currentValue[c]
      } else if(c=='required' && currentValue[c]) {
        accumulator.required.push(currentValue.name)
      }
      return a
    },{})
    accumulator.properties[currentValue.name]=schemaObj;
    return accumulator;
  },initialSchema)
}

/**
 * parse the params from the swagger doc that are marked as being in the body of the request
 * @param parameters
 * @returns {{params, initialSchema: {type: string, properties: {}, required: Array}}}
 */
function parseBodyParams(parameters) {
  //if there are params within the body, then there's a schema already made for them, so start with that
  var params=JSON.parse(JSON.stringify(parameters)) //make a copy so you don't modify the swagger!
  const bodyIndex=params.findIndex(param=>param.name=='body')
  let initialSchema={
    type:'object',
    properties:{},
    required:[]
  }
  if(bodyIndex>-1) {
    //make a copy so you don't modify the swagger!
    initialSchema=params[bodyIndex].schema
    if(!initialSchema.required) {
      initialSchema.required=[]
    }
    params.splice(bodyIndex,1)
  }
  //don't allow any params to be passed that aren't specified in the swagger
  initialSchema.additionalProperties=false
  return {params,initialSchema}
}

/**
 * find the primary key from parameters of a given endpoint in a swagger doc
 * @param parameters
 * @returns {{text: string, values}|T}
 */
function findPrimaryKey(parameters) {
  return parameters.find((param)=>{ //assumes primary key is the only path param in the path
    return param.in=='path'
  })
}

module.exports={
  getSwaggerParams:getSwaggerParams,
  swaggerParamsToSchema:swaggerParamsToSchema,
  findPrimaryKey:findPrimaryKey,
  matchPathWithPathParam:matchPathWithPathParam
}