{function Main() {
    // 加载菜单列表
    LoadMenuList();
}
async function LoadMenuList() {
    // 加载hexcastingLogo点击跳转事件
    document.getElementById('HexcastingLogo').addEventListener('click', () => {
        window.location.href = GetGlobalConstant('GithubHexcasting');
    });
    // 获取菜单列表
    const MenuList = await fetch(GetGlobalConstant('MenuList')).then(response => response.json());
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
            window.location.href = GetGlobalConstant(item.Link);
        });
        // 判断当前页面是否为菜单链接或首页或工具页面
        if (!CompareURL(currentPage, item.Link)) {
            // 添加li元素到菜单列表
            MenuListElement.appendChild(li);
        }
    }
}

Main()}

//比较url是否相同
function CompareURL(url1, url2) {
    //去除末尾html标记
    url1 = url1.replace(/\.html$/, '');
    url2 = url2.replace(/\.html$/, '');
    return url1 == url2;
}
function GetGlobalConstant(ConstantName){
    switch (ConstantName) {
        case 'HexcastingLogo':
            return '/Resource/Img/HexcastingLogo.png';
        case 'LogoBackgroundImage':
            return '/Resource/Img/LogoBackgroundImage.webp';
        case 'RandomIntroduction':
            return '/Resource/Config/RandomIntroduction.json';
        case 'MenuList':
            return '/Resource/Config/MenuList.json';
        case 'ToolList':
            return '/Resource/Config/ToolList.json';
        case 'GithubHexcasting':
            return 'https://github.com/FallingColors/HexMod';
        default:
            return null;
    }
}