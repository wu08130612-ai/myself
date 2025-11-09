##变量的创建
user_name = "wuronghua"
print(user_name)
age = 114514
print(age)
height =1.83
print(height)
## 字符串的拼接
print("我是" + user_name + "，我今年" + str(age) + "岁了")
print("明年我就" + str(age +1) +"岁了")
##type()函数可以查看变量的类型
print(type(age))
print(type(height))
print(type(user_name))
print(type(True))
print(type(False))
print(True+1)
print(False+1)
print(False)
##列表的创建，列表的最后一位是列表中的数量减一
to_do_list = ["学习列表","搞定循环","今天看完语法基础的一半"]
print(to_do_list)
## 列表的增加（append）
to_do_list.append("wanyuanshen")
print(to_do_list)
## 列表的删除（remove）
to_do_list.remove("wanyuanshen")
print(to_do_list)
## 列表的修改（索引赋值）
to_do_list[2]= "wanhuoying"
print(to_do_list)
##列表的删除（del
del to_do_list[2]
print(to_do_list)