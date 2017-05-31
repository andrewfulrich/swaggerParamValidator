const tape=require('tape')
const swagger=require('../test_files/swagger.json')
const val=require('../validator')(swagger)


tape('returns a 422 when invalid limit',(t)=>{
  t.plan(1)
  let req={
    params:{},
    body:{},
    query:{
      limit:-1,
      offset:2,
      orderBy:'testEdge1',
      isAscOrder:false
    },
    method:'get',
    url:'http://localhost/api/testNode0',
    host:'http://localhost'
  }
  let res={
    status:(statNum)=>{
      t.equal(statNum,422,'http status should be 422')
      return res
    },
    json:(message)=>{}
  }
  val.validateAsMiddleware(req,res,()=>{})
})

tape('returns a 422 when invalid primary key',(t)=>{
  t.plan(1)
  let req={
    params:{},
    body:{},
    query:{},
    method:'delete',
    url:'http://localhost/api/testNode0/2',
    host:'http://localhost'
  }
  let res={
    status:(statNum)=>{
      t.equal(statNum,422,'http status should be 422')
      return res
    },
    json:(message)=>{}
  }
  val.validateAsMiddleware(req,res,()=>{})
})

tape('returns a 422 when invalid createdDate',(t)=>{
  t.plan(1)
  let req={
    params:{},
    body:{
      createdDate:'asdf'
    },
    query:{
      limit:1,
      offset:2,
      orderBy:'testEdge1',
      isAscOrder:false
    },
    method:'get',
    url:'http://localhost/api/testNode0',
    host:'http://localhost'
  }
  let res={
    status:(statNum)=>{
      t.equal(statNum,422,'http status should be 422')
      return res
    },
    json:(message)=>{}
  }
  val.validateAsMiddleware(req,res,()=>{})
})

tape('returns a 422 when invalid uri',(t)=>{
  t.plan(1)
  let req={
    params:{},
    body:{
      imageSrc:'\\//asdf'
    },
    query:{
      limit:1,
      offset:2,
      orderBy:'testEdge1',
      isAscOrder:false
    },
    method:'get',
    url:'http://localhost/api/testNode0',
    host:'http://localhost'
  }
  let res={
    status:(statNum)=>{
      t.equal(statNum,422,'http status should be 422')
      return res
    },
    json:(message)=>{
      console.log(message)
    }
  }
  val.validateAsMiddleware(req,res,()=>{})
})

tape('returns a 200 when valid params',(t)=>{
  t.plan(1)
  let req={
    params:{},
    body:{},
    query:{
      limit:1,
      offset:2,
      orderBy:'testEdge1',
      isAscOrder:false,
      createdDate:'2017-05-31T06:07:42.640Z',
      imageSrc:'http://www.example.com/22.png'
    },
    method:'get',
    url:'http://localhost/api/testNode0',
    host:'http://localhost'
  }
  let res={
    status:(statNum)=>{
      t.fail('status has been set rather than passing to next middleware function')
      return res
    },
    json:(message)=>{
      t.fail('body has been sent rather than passing to next middleware function')
      console.log('error message:',message)
    }
  }
  val.validateAsMiddleware(req,res,()=>{
    t.ok('next function has been hit')
  })
})