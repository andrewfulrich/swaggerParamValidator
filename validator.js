/**
 Swagger Param Validator

 Validates requests based on a given swagger doc

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

const tv4 = require('tv4')
const swaggerParamParser = require('./swaggerParamParser')

module.exports = function makeSwaggerValidator(swagger) {

  /**
   * validates a request
   * @param req
   */
  function validate(req) {
    const swaggerParams = swaggerParamParser.getSwaggerParams(req, swagger)
    const paramsSchema = swaggerParamParser.swaggerParamsToSchema(swaggerParams)
    const params = Object.assign(req.params, req.body, req.query)
    const validationResult = tv4.validateMultiple(params, paramsSchema)
    if (validationResult.errors.length) {
      validationResult.errors.forEach((err) => {
        delete err.stack //don't expose the stack to the public - not useful in this case for dev anyway
      })
      throw new ValidationErrors(validationResult.errors)
    }
    if (validationResult.missing.length) {
      throw new Error('Missing schema references: ' + validationResult.missing)
    }

    if (req.method.toLowerCase() == 'put') {
      const primaryKeyName = swaggerParamParser.findPrimaryKey(swaggerParams).name
      const toUpdate = Object.keys(req.body).filter((c) => c !== primaryKeyName)
      if (toUpdate.length == 0) {
        throw new ValidationErrors([{
          code: 13, //tv4's ErrorCodes.NOT_PASSED
          message: 'cannot update: no fields or values were given'
        }])
      }
    }
  }

  /**
   * validation error object
   */
  class ValidationErrors {
    constructor(errors) {
      this.errors = errors
    }
  }

  /**
   * express middleware function that validates the path param (which is usually the primary key)
   * @param req
   * @param res
   * @param next
   */
  function validatePrimaryKeyAsMiddleware(req, res, next) {
    const swaggerParams = swaggerParamParser.getSwaggerParams(req, swagger)
    const primaryKey = swaggerParamParser.findPrimaryKey(swaggerParams)
    const primaryKeySchema = swaggerParamParser.swaggerParamsToSchema([primaryKey])
    const params = Object.assign(req.params, req.body, req.query)
    delete primaryKeySchema.additionalProperties //allow other fields, we only want to validate primary key for now
    const validationResult = tv4.validateMultiple(params, primaryKeySchema)
    if (validationResult.errors.length) {
      validationResult.errors.forEach((err) => {
        delete err.stack //don't expose the stack to the public - not useful in this case for dev anyway
      })
      res.status(422).json(validationResult.errors)
    } else {
      next()
    }
  }

  /**
   * express middleware function the validates a request
   * @param req
   * @param res
   * @param next
   */
  function validateAsMiddleware(req, res, next) {
    try {
      validate(req)
      next()
    } catch (e) {
      if (e instanceof ValidationErrors) {
        res.status(422).json(e.errors)
      } else {
        res.status(500).send(e.stack)
      }
    }
  }

  return {
    validate: validate,
    validateAsMiddleware: validateAsMiddleware,
    ValidationErrors: ValidationErrors,
    validatePrimaryKeyAsMiddleware: validatePrimaryKeyAsMiddleware
  }
}