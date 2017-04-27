const tape=require('tape')
const swagger=require('../test_files/swagger.json')
const val=require('../validator')(swagger)


tape('returns a 422 when invalid limit',(t)=>{
  t.plan(1)
  let req={
    params:{},
    body:{},
    query:{
      limit:'-1',
      offset:'2',
      orderBy:'testEdge1',
      isAscOrder:'false'
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
