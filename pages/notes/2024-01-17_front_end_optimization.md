---
title: Optimizing Front End Performance
place: Zürich, Switzerland
date: 2024-01-17T16:00:00.000+01:00
lang: en
type: note+blog
duration: 15 min
---

The look of the internet has changed immensely over the last few years. They are often packed with interactivity, animations, and other features. Hardware has been steadily improving, which fueled the development of more complex websites, user interfaces, and software in general.

Anything a developer might dream up is already legitimized to be implemented, but I strongly believe in making software as fast as possible.


Especially the web serves as a platform for interaction. A fast, responsive website is crucial for a positive user experience. Slow websites can be frustrating (and lead to high bounce rates and lost revenue). 

This article discusses four modern techniques - Preload, Prefetch, Preconnect, and DNS Prefetch - to optimize website speed. I intend to apply these techniques to the website you are currently visiting.

Essentially, these techniques allow resources to be loaded without blocking the main page load process (the document's `onload` event). The decision of when the optimal time to load a resource is deferred to the browser. This is based on the resource's priority and the user's network conditions.

## Preload

Preload reduces page load time by preloading critical resources like CSS, JavaScript, and images. When a user visits your website, these resources are already in their browser cache. To use preload, add the following link tag to your HTML code:

```js
// Preloading a resource
<link rel="preload" href="your-resource-here" as="resource-type">
```
The `href` attribute specifies the resource URL and the `as` attribute specifies the resource type. For example, to preload a CSS file or an image:

```js
// Preloading a CSS file and an image
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="image.jpg" as="image">
```

This makes sense for resources any website needs, such as CSS, JavaScript, and images. However, it's not recommended for resources that are only needed on specific pages. For example, if you have a large image on a page that is rarely visited, preloading it would be a waste of resources.

## Prefetch

Prefetch loads resources needed on subsequent pages, similar to Preload but for future needs. For example, prefetch an image on a linked page to load it faster when the user clicks the link. To use prefetch, add the following link tag:

```js
// Prefetching a resource
<link rel="prefetch" href="your-resource-here">
```
The `href` attribute specifies the resource URL. For example, to prefetch an image:

```js
// Prefetching an image
<link rel="prefetch" href="image.jpg">
```

This can make switching between pages feel significantly faster. 

## Preconnect

Preconnect establishes a server connection before resource requests, reducing latency. To use preconnect, add the following link tag:

```js
// Preconnecting to a server
<link rel="preconnect" href="your-server-here">
```
The `href` attribute specifies the server URL. For example, to preconnect to a server or cdn hosting your CSS file:

```js
// Preconnecting to a server hosting a CSS file or images
<link rel="preconnect" href="https://your-resources-host-here">
```

## DNS Prefetch

DNS Prefetch resolves the domain name of a resource before it's requested, reducing DNS resolution time. To use DNS Prefetch, add the following link tag. The `href` attribute specifies the domain name. For example, to prefetch the domain name of a CDN:


```js
// DNS Prefetching domain name
<link rel="dns-prefetch" href="https://your-cdn.com">
```
By prefetching the domain name, the browser can resolve the server's IP address in advance. This is useful for servers that host required resources (such as images), as it reduces the latency of subsequent requests.

### Preconnect vs DNS Prefetch

Preconnect and DNS Prefetch differ in purpose and scope. Preconnect establishes an early connection to a server and downloads critical resources, while DNS Prefetch resolves the domain name of a server in advance. Preconnect is used for critical resources needed early in the page load process, while DNS Prefetch is typically used for resources needed later.

## Advantages and Disadvantages

### Advantages

* **Improved website performance**: Preload, prefetch, preconnect, and DNS prefetch can reduce latency and optimize resource loading.
* **Better user experience**: Faster load times can enhance user experience, as visitors are more likely to stay on a fast-loading website.
* **Increased engagement**: A responsive website can increase visitor interaction.
* **Improved SEO**: Faster websites can improve search engine rankings, as website speed is a factor in search results for most search engines.

### Disadvantages

Despite their benefits, these methods have potential downsides.

* **Increased network bandwidth**: These techniques can increase (user) network bandwidth consumption, as resources are downloaded and cached in advance.
* **Increased server load**: Server load can increase, as resources are requested and cached in advance.
* **Risk of cache pollution**: Preloading and prefetching unnecessary resources can lead to cache pollution, reducing these techniques' effectiveness.
* **Implementation complexity**: Implementing these techniques requires technical knowledge and can be complex for large or complex websites.

## Tips and Tricks

A few bits of advice for using these techniques - as collected from research and experience.

* **Use techniques sparingly**: While these techniques can improve website performance, excessive use can have the opposite effect. Only preload, prefetch, and preconnect resources that are critical or likely to be needed soon.
* **Prioritize above-the-fold content**: Improve perceived performance by preloading and prefetching resources needed for above-the-fold content, the part of the page visible without scrolling.
* **Optimize images**: Reduce image file size to improve load times. Use image compression tools or the appropriate image format (e.g., JPEG for photos, PNG / SVG for graphics).
* **Implement caching**: Reduce requests and improve load times with caching. Use HTTP caching headers (e.g., cache-control, expires) to specify how long resources should be cached.
* **Use a reliable hosting provider**: A fast and reliable hosting provider can improve page load time. Choose a host that suits your needs. This page is still hosted on GitHub Pages, as it is a static website and is supposed to remain relatively simple. I might switch to a different host in the future.


## Conclusion

Optimal website speed is crucial to allow for the UX to effectively center around the website's content - and not be muddled with frustation on waiting. Techniques like Preload, Prefetch, Preconnect, and DNS Prefetch can reduce latency and manage resources for faster load times. 

Implementing these methods enhances your website's performance, but use them appropriately to avoid excess resource consumption and potential device overload.