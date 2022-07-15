<template>
  <div>
    <el-dialog :title="item.title" :visible.sync="item.show">
      <el-form @submit.native.prevent>
        <el-form-item label="标题" required>
          <el-input ref="input" v-model="item.name" @keyup.enter.native.stop="wayEdit"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="wayEdit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {
          show: false,
          name: '',
          title: '编辑'
        }
      }
    }
  },
  watch: {
    'item.show': {
      handler: function (val) {
        if (val) {
          this.$nextTick(() => {
            this.$refs.input.focus()
          })
        }
      }
    }
  },
  methods: {
    wayEdit() {
      if (this.item.name === '') {
        this.$message.warning('名称不能为空')
        return false
      }
      this.$emit('wayEdit')
      this.item.show = false
    }
  }
}
</script>