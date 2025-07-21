<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'danger'
  }
})
</script>
<template>
  <table class="custom-block" :class="props.variant">
    <tbody>
      <tr class="title custom-block" :class="props.variant">
        <td colspan="3">
          {{props.title}}
        </td>
      </tr>
      <slot/>
    </tbody>
  </table>
</template>


<style scoped>
table.custom-block {
  width: 100%;
  border-collapse: collapse;
  border: none;
  padding-top: 0;
  padding-left: 0;
  padding-right: 0;
}
thead, tbody {
  width: 100%;
  border: none;
}
tr.title {
  font-weight: bold;
  border: none;
  text-align: center;
  border: none;
}
.title td {
  border: none;
}
</style>