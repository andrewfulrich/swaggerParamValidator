const tape=require('tape')
const swaggerParamParser=require('../swaggerParamParser')

tape('swaggerParamsToSchema makes correct schema',t=>{
  t.plan(1)
  const params=[
    {
      type:'string',
      name:'foo',
      in:'path',
      required:true,
      maxLength:2
    },
    {
      type:'integer',
      name:'baz',
      in:'body',
      required:false
    }
  ]
  const expected={
    type:'object',
    properties:{
      foo:{
        type:'string',
        maxLength:2
      },
      baz:{
        type:'integer',
      }
    },
    required:['foo'],
    additionalProperties:false
  }
  t.deepEqual(swaggerParamParser.swaggerParamsToSchema(params),expected,'should get the expected schema')
})

tape('swaggerParamsToSchema makes correct schema when there are params within the body',t=>{
  t.plan(1)
  const params=[
    {
      type:'string',
      name:'foo',
      in:'path',
      required:true,
      maxLength:2
    },
    {
      type:'integer',
      name:'baz',
      in:'body',
      required:false
    },
    {
      type:'integer',
      name:'body',
      in:'body',
      required:true,
      schema:{
        type:'object',
        properties:{
          fo:{
            type:'string'
          },
          fum:{
            type:'integer'
          }
        },
        required:['fo']
      }
    }
  ]
  const expected={
    type:'object',
    properties:{
      foo:{
        type:'string',
        maxLength:2
      },
      baz:{
        type:'integer',
      },
      fo:{
        type:'string'
      },
      fum:{
        type:'integer'
      }
    },
    required:['fo','foo'],
    additionalProperties:false
  }
  t.deepEqual(swaggerParamParser.swaggerParamsToSchema(params),expected,'should get the expected schema')
})

tape('swaggerParamsToSchema makes correct schema with params within the body when called twice',t=>{
  //this is important because we want to make sure the original swagger params are not modified
  t.plan(1)
  const params=[
    {
      type:'string',
      name:'foo',
      in:'path',
      required:true,
      maxLength:2
    },
    {
      type:'integer',
      name:'baz',
      in:'body',
      required:false
    },
    {
      type:'integer',
      name:'body',
      in:'body',
      required:true,
      schema:{
        type:'object',
        properties:{
          fo:{
            type:'string'
          },
          fum:{
            type:'integer'
          }
        },
        required:['fo']
      }
    }
  ]
  const expected={
    type:'object',
    properties:{
      foo:{
        type:'string',
        maxLength:2
      },
      baz:{
        type:'integer',
      },
      fo:{
        type:'string'
      },
      fum:{
        type:'integer'
      }
    },
    required:['fo','foo'],
    additionalProperties:false
  }
  swaggerParamParser.swaggerParamsToSchema(params)
  t.deepEqual(swaggerParamParser.swaggerParamsToSchema(params),expected,'should get the expected schema')
})

tape('swaggerParamsToSchema makes correct schema when there are params within the body with no required',t=>{
  t.plan(1)
  const params=[
    {
      type:'string',
      name:'foo',
      in:'path',
      required:true,
      maxLength:2
    },
    {
      type:'integer',
      name:'baz',
      in:'body',
      required:false
    },
    {
      type:'integer',
      name:'body',
      in:'body',
      required:true,
      schema:{
        type:'object',
        properties:{
          fo:{
            type:'string'
          },
          fum:{
            type:'integer'
          }
        }
      }
    }
  ]
  const expected={
    type:'object',
    properties:{
      foo:{
        type:'string',
        maxLength:2
      },
      baz:{
        type:'integer',
      },
      fo:{
        type:'string'
      },
      fum:{
        type:'integer'
      }
    },
    required:['foo'],
    additionalProperties:false
  }
  t.deepEqual(swaggerParamParser.swaggerParamsToSchema(params),expected,'should get the expected schema')
})

tape('findPrimaryKey finds the primary key name',t=>{
  t.plan(1)
  const params=[
    {
      type:'string',
      name:'foo',
      in:'path',
      required:true,
      maxLength:2
    },
    {
      type:'integer',
      name:'baz',
      in:'body',
      required:false
    }
  ]
  t.equal(swaggerParamParser.findPrimaryKey(params).name,'foo','should get the primary key name foo')
})

tape('match url with path params',t=>{
  t.plan(2)
  const candidatePaths=[
    'find/{nothing}/here',
    'find/{nothing}/{else}/here',
    'also/find/nothing/here',
    'not/here/either',
    'find/{something}/at/this',
    'next/{shouldntFindThis}',
    'next/{test}/find',
  ]
  t.equal(swaggerParamParser.matchPathWithPathParam('find/something3/at/this',candidatePaths),candidatePaths[4],'should match the path 4')
  t.equal(swaggerParamParser.matchPathWithPathParam('next/23/find',candidatePaths),candidatePaths[6],'should match the path at 6')
})