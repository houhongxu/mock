# react

## 实现 jsx

### 编译时

由 babel,ts 等 实现，转换为 React，api 方法

- react17 之前是 React.createElement 方法，需要导入 React
- react17 之后是 react/jsx-runtime 里的 jsx 方法，与编译器合作，不需要导入 React

> [详情见官方链接](https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

### 运行时

仍然是手动引入 React.createElement 方法，React.createElement 调用内部的 jsx 方法

## 学习到的知识

### Object.hasOwn 替换 Object.prototype.hasOwnProperty

Object.hasOwn 解决的问题：

- Object.hasOwn(obj,prop)直接使用而 Object.prototype.hasOwnProperty.call(obj,prop)

- Object.create(null) 会创建一个不从 Object.prototype 继承的对象，这使得 Object.prototype 上的方法无法访问。

- 如果你对对象的内置属性进行了重新赋值改写，那么你在调用某个属性（比如：.hasOwnProperty）时，肯定调用的不是对象的内置属性

- 在 ESLint 的规则 built-in rule 中，是禁止直接使用 Object.prototypes 内置函数