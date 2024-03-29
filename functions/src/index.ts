// CommonJS => require(), module.exports
// ESM => import, export
import * as admin from 'firebase-admin'
// 초기화 (맨 위에 있어야 함)
admin.initializeApp()

import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import todo from './routes/todo'
// import './jobs'

const app = express()
app.use(express.json())
app.use(cors({
  origin: [ // whiteList
    'https://localhost:3000', 
    'kdt-test-465e8.web.app',
    'kdt-test-465e8.firebaseapp.com'
  ]
}))
app.use('/todo', todo)

export const api = functions
.region('asia-northeast3')
.https.onRequest(app)
// https://localhost:5001/kdt-test-465e8/asia-northeast3/api/todo
// https://asia-northeast3/kdt-test-465e8/api/todo

