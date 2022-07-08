import * as admin from 'firebase-admin'
import * as express from 'express'
import { saveFile } from '../utils'

const db = admin.firestore()
const router = express.Router()

interface Todo {
  id?: string
  title: string
  image?: string | null
  done: boolean
  createdAt: string
  updatedAt: string
  deleted: boolean
}



// http://localhost:5001/kdt-test-465e8/us-central1/api/todo
// 투두 조회
router.get('/', async (req, res) => {
  const snaps = await db.collection('Todos')
    // .where('done', '==', 'false') // 쿼리(필터링 용도)
    .where('deleted', '!=', true)
    .get()
    const todos: Todo[] = []

    snaps.forEach(snap => {
      const fields = snap.data()
      todos.push({
        id: snap.id,
        ...fields as Todo
      })
    })

  // 최신일 기준으로 재정렬
  todos.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  res.status(200).json(todos)
})

// 투두 추가
router.post('/', async (req, res) => {
  const { title, imageBase64 } = req.body
  const date = new Date().toISOString()
  
  // 스토리지에 파일 저장
  let image = ''
    try {
      image = await saveFile(imageBase64)
    } catch(error) {
      console.log(error)
    }

  const todo: Todo = {
    title,
    image,
    done: false,
    createdAt: date,
    updatedAt: date,
    deleted: false
  }

  const ref = await db.collection('Todos').add(todo)

  res.status(200).json({
    id: ref.id,
    ...todo
  })
})

// 투두 수정
// 동적 파라미터 '/:id'
router.put('/:id', async (req, res) => {
  const { title, done, imageBase64 } = req.body
  const { id } = req.params

  // 스냅샷(snapshot)
  const snap = await db.collection('Todos').doc(id).get()
  if(!snap.exists){
    return res.status(404).json('존재하지 않는 정보입니다.')
  }

  // 스토리지에 파일 저장
    let image = ''
    try {
      image = await saveFile(imageBase64)
    } catch(error) {
      console.log(error)
    }

  const { createdAt } = snap.data() as Todo
  const updatedAt = new Date().toDateString()
  await snap.ref.update({
    title,
    done,
    image,
    updatedAt
  })

  return res.status(200).json({
    id: snap.id,
    title,
    done,
    image,
    createdAt,
    updatedAt
  })
})

// 투두 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const snap = await db.collection('Todos').doc(id).get()
  // 예외 처리
  if(!snap.exists){
    return res.status(404).json('존재하지 않는 정보입니다.')
  }
  await snap.ref.update({
    deleted: true
  })

  res.status(200).json(true)
  return
})

export default router
