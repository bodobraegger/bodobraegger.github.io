<script setup lang="ts">
import { reactive } from 'vue';

type folder = {
    name: string,
    images: string[]
}
type image = {
    src: string,
    alt: string,
    folder: string,
    show: boolean
}

const imageSrcs = reactive<image[]>([]);
const folders = [] as folder[];
const imageModules = import.meta.glob('/public/**/**.{png,jpg,jpeg,gif,svg}');
for (let path in imageModules) {
    path = path.replace('/public', '')
    if(!path.includes('logos')){
        let parentFolder = path.split('/').slice(3, -1)[0]
        if (!parentFolder)
            imageSrcs.push( {src: path, alt: path.split('/').pop()!.slice(0, -4), folder: 'root', show: true })
        else if (path.includes(parentFolder)) {
            let folder = folders.find(folder => folder.name === parentFolder)
            let parentFolderSanitized = parentFolder.replaceAll(' ', '_').replaceAll(',', '-')
            if (folder) {
                folder.images.push(path)
                let position = folder.images.length - 1
                imageSrcs.push({ src: path, alt: `${parentFolder}, p. ${position}`, folder: parentFolderSanitized, show: false })
            }
            else {
                folders.push({ name: parentFolder, images: [path] })
                imageSrcs.push({ src: path, alt: `${parentFolder}, cover`, folder: parentFolderSanitized, show: true })
            }
        }
    }
}
</script>

<template>
<div class="columns-2 md:columns-3 lg:columns-4 xl:columns-5">
    <figure v-for="image in imageSrcs" :key="image.src" class="w-full prose break-inside-avoid py-2" :class="image.show ? '' : 'hidden'">
        <img class="mb-0!"
            :src="image.src" :id="image.src" 
            :class="image.src.split('/').slice(0, -1)"
            :data-folder="image.folder" 
            :data-caption="image.alt"
            :alt="image.alt"
        />
        <figcaption>{{ image.alt.split(',').shift()! }}</figcaption>
    </figure>
</div>
</template>

<style scoped>
.grid {
    grid-template-rows: auto 1fr;
    align-items: start;
}
</style>