{function Main() {
    // 加载菜单列表
    LoadMenuList();
}

async function LoadMenuList() {
    // 获取菜单列表
    const MenuList = await fetch('/Resource/MenuList.json').then(response => response.json());
    // 获取当前页面路径
    const currentPage = window.location.pathname;
    // 获取html页面菜单无序列表
    const MenuListElement = document.getElementById('MenuList');
    // 清空菜单列表
    MenuListElement.innerHTML = '';
    // 遍历菜单列表
    for (const item of MenuList) {
        // 创建li元素
        const li = document.createElement('li');
        // 设置li元素内容
        li.textContent = item.Name;
        // 设置li元素id
        li.id = item.ID;
        // 设置li元素触发器
        li.addEventListener('click', () => {
            // 切换到新页面
            window.location.href = item.Link;
        });
        // 判断当前页面是否为菜单链接或首页或工具页面
        if (currentPage != item.Link) {
            // 添加li元素到菜单列表
            MenuListElement.appendChild(li);
        }
    }
}

Main()}