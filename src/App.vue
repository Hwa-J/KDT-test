<template>
  <input 
    type="file" 
    @change="selectFile" />
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent } from 'vue'

export default defineComponent({
  created() {
    console.log(import.meta.env.DEV)
  },
  methods: {
    selectFile(event: Event) {
      const files = (event.target as HTMLInputElement).files as FileList
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener('load', async e => {
          // console.log((e.target as FileReader).result)
          const url = import.meta.env.DEV
            ? 'http://localhost:5001/kdt-test-465e8/us-central1/api/todo'
            : 'https://us-central1-kdt-test-465e8.cloudfunctions.net/api/todo'
          const { data } = await axios({
            url,
            method: 'POST',
            data: {
              title: '파일 추가!',
              imageBase64: (e.target as FileReader).result
            }
          })
          console.log('투두 생성 응답:', data)
            
        })
      }
    }
  }
})

</script>
