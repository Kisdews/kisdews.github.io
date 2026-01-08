/**
 * Blogs 页面专用脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化博客列表
    initBlogsList();
});

async function initBlogsList() {
    const blogsList = document.getElementById('blogs-list');
    
    try {
        // 尝试从 posts 目录加载博客文章
        // 注意：GitHub Pages 需要特殊处理才能列出目录
        // 这里先使用示例数据
        const blogs = await loadBlogs();
        
        if (blogs.length === 0) {
            blogsList.innerHTML = '<p>暂无博客文章</p>';
            return;
        }
        
        // 渲染博客列表
        blogsList.innerHTML = blogs.map(blog => `
            <article class="blog-item">
                <h3><a href="${blog.link || '#'}">${blog.title}</a></h3>
                <p>${blog.excerpt || ''}</p>
                <div class="blog-meta">
                    <time datetime="${blog.date}">${blog.date}</time>
                    ${blog.tags ? `<div class="blog-tags">${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}</div>` : ''}
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('加载博客列表失败:', error);
        blogsList.innerHTML = '<p>加载失败，请稍后重试</p>';
    }
}

async function loadBlogs() {
    // 示例：从 posts 目录加载博客文章
    // 实际实现需要根据你的博客系统来调整
    const blogs = [];
    
    // 可以尝试加载已知的博客文件
    // 例如：const response = await fetch('../posts/hello-world.md');
    
    return blogs;
}

