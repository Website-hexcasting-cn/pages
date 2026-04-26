function StartFunctionList() {
    // 工具列表
    const ToolList = document.getElementById("ToolList");
    // 初始化工具列表文字
    ToolList.setAttribute('IsToolListText', 'true');
    // 绑定双击事件
    ToolList.addEventListener('dblclick', (e) => {
        const IsToolListText = ToolList.getAttribute('IsToolListText');
        //判断是否隐藏工具列表文字
        if (IsToolListText == 'false') {
            // 显示工具列表
            ToolList.setAttribute('IsToolListText', 'true');
        } else {
            // 隐藏工具列表文字
            ToolList.setAttribute('IsToolListText', 'false');
        }
    });
}
StartFunctionList();