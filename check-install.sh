#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查包管理器
check_package_manager() {
    if command -v $1 &> /dev/null; then
        return 0
    fi
    return 1
}

# 选择包管理器
if check_package_manager pnpm; then
    PM="pnpm"
elif check_package_manager cnpm; then
    PM="cnpm"
elif check_package_manager npm; then
    PM="npm"
else
    echo -e "${RED}错误: 未找到任何包管理器(pnpm/cnpm/npm)，请先安装${NC}"
    exit 1
fi

# 安装依赖
echo -e "${YELLOW}正在使用 ${PM} 安装依赖...${NC}"
$PM install --no-audit

if [ $? -eq 0 ]; then
    touch ./node_modules/.installed
    echo -e "${GREEN}依赖安装完成！${NC}"
else
    echo -e "${RED}依赖安装失败，请检查网络或手动安装${NC}"
    exit 1
fi