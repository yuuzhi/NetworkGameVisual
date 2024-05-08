<script>
export default {
  name: 'ToolComponent'
}
</script>

<template>
  <div  style="height: 8vh;width: 100%;padding: 10px" >
    <el-text style="font-size: large;align-items: center;" tag="b">上传配置文件</el-text>
    <div style="height: 1vh"></div>
    <el-row>
      <el-col :span="12">
        <el-upload
            class="upload"
            action="#"
            :limit="1"
            :show-file-list="false"
            accept=".json"
            ref="uploadBanner">
          <el-button type="primary" color='#364f6b'>上传配置文件</el-button>
        </el-upload>
      </el-col>
      <el-col :span="12">
        <el-upload
            class="upload"
            action="#"
            :limit="1"
            :show-file-list="false"
            accept=".json"
            ref="uploadBanner">
          <el-button type="primary" color='#364f6b'>上传Log文件</el-button>
        </el-upload>
      </el-col>
    </el-row>
  </div>

</template>

<style scoped>
.upload{
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
</style>
