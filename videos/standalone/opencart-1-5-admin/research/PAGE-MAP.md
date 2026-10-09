# 后台页面与源码地图

2026-10-09，CASE-A 本地源码。此表是 27 个代表路由的静态覆盖，未登录运行中的后台。用途标签是对菜单与代码职责的概括，不代表原页面标题或真实岗位名称。

每个控制器位于 `admin/controller/<路由>.php`；表中模板位于 `admin/view/template/`。模型以 `admin/model/` 为根；详细多模型、多模板引用及逐文件哈希见 [测量输出](lab/out_01_case_inventory.json)。

## 代表路由

| 用途 | 路由 | 主要模板 | 控制器行数 | 模板行数 |
|---|---|---|---:|---:|
| 登录 | `common/login` | `common/login.tpl` | 278 | 133 |
| 工作台 | `common/home` | `common/home.tpl` | 437 | 1,366 |
| 商品与库存列表 | `catalog/product` | `catalog/product_list.tpl` | 1,320 | 415 |
| 库存与入库相关页 | `catalog/stock` | `catalog/stock.tpl` | 1,053 | 243 |
| 出库相关页 | `catalog/outstock` | `catalog/outstock.tpl` | 1,181 | 287 |
| 库位管理 | `catalog/kuweigl` | `catalog/kuweigl_list.tpl` | 1,497 | 203 |
| 批量入库 | `catalog/batchstock` | `catalog/batchstock.tpl` | 1,048 | 64 |
| 采购计划 | `office/procurement_plan` | `office/procurement_plan.tpl` | 840 | 357 |
| 采购入库 | `office/instock` | `office/instock.tpl` | 284 | 315 |
| 订单或出库记录列表 | `sale/order` | `sale/order_list.tpl` | 2,413 | 463 |
| 入库记录 | `sale/stockhistory` | `sale/stockhistory.tpl` | 724 | 278 |
| 计提出库相关列表 | `sale/orderjt` | `sale/orderjt_list.tpl` | 1,881 | 260 |
| 计提记录 | `sale/stockhistoryjt` | `sale/stockhistoryjt.tpl` | 574 | 222 |
| 财务相关列表 | `caiwu/orderlistprint` | `caiwu/orderlistprint.tpl` | 1,396 | 743 |
| 称重操作 | `wuliuweight/weight` | `wuliuweight/weight.tpl` | 210 | 182 |
| 称重记录 | `wuliuweight/weightlist` | `wuliuweight/weightlist.tpl` | 3,019 | 481 |
| 仓库岗位绩效 | `query/warehouse_salary_query` | `query/warehouse_salary_query.tpl` | 227 | 3,743 |
| 打单岗位工资 | `query/order_salary_query` | `query/order_salary_query.tpl` | 732 | 3,520 |
| 用户管理 | `user/user` | `user/user_list.tpl` | 519 | 95 |
| 用户组与权限 | `user/user_permission` | `user/user_group_list.tpl` | 422 | 55 |
| 系统设置 | `setting/setting` | `setting/setting.tpl` | 944 | 772 |
| 近期入库查询 | `sale/stockhistory_record_clickhouse` | `sale/stockhistory_record_clickhouse.tpl` | 2,029 | 7,608 |
| 近期出库查询 | `sale/order_record_clickhouse` | `sale/order_record_clickhouse.tpl` | 2,029 | 7,608 |
| 近期计提查询 A | `sale/accrual_record_clickhouse` | `sale/accrual_record_clickhouse.tpl` | 2,438 | 8,317 |
| 近期计提查询 B | `caiwu/accrual_record_clickhouse` | `caiwu/accrual_record_clickhouse.tpl` | 2,032 | 7,608 |
| 近期称重查询 | `wuliuweight/weight_record_clickhouse` | `wuliuweight/weight_record_clickhouse.tpl` | 1,732 | 6,920 |
| 列存订单查询 | `sale/order_clickhouse` | `sale/order_clickhouse.tpl` | 2,342 | 4,869 |

## 控制器到模型

这里只列直接通过 `load->model` 声明的依赖；同页可能还通过连接器、辅助类或其他方法间接访问数据。

| 路由 | 直接声明的模型 |
|---|---|
| `common/login` | 未匹配到直接声明 |
| `common/home` | `sale/order.php`、`sale/customer.php`、`catalog/product.php`、`catalog/review.php`、`alipay/downorder.php` |
| `catalog/product` | `catalog/product.php`、`sale/order.php`、`tool/image.php`、`catalog/category.php`、`localisation/language.php`、`setting/store.php`、`catalog/manufacturer.php`、`localisation/stock_status.php`、`localisation/tax_class.php`、`localisation/weight_class.php`、`localisation/length_class.php`、`sale/customer_group.php`、`catalog/download.php` |
| `catalog/stock` | `catalog/stock.php`、`catalog/product.php`、`tool/image.php`、`localisation/language.php`、`setting/store.php`、`catalog/manufacturer.php`、`localisation/stock_status.php`、`localisation/tax_class.php`、`localisation/weight_class.php`、`localisation/length_class.php`、`sale/customer_group.php`、`catalog/download.php`、`catalog/category.php` |
| `catalog/outstock` | `catalog/outstock.php`、`catalog/stock.php`、`catalog/product.php`、`tool/image.php`、`localisation/language.php`、`setting/store.php`、`catalog/manufacturer.php`、`localisation/stock_status.php`、`localisation/tax_class.php`、`localisation/weight_class.php`、`localisation/length_class.php`、`sale/customer_group.php`、`catalog/download.php`、`catalog/category.php` |
| `catalog/kuweigl` | `catalog/kuweigl.php`、`localisation/language.php`、`setting/store.php`、`tool/image.php` |
| `catalog/batchstock` | `catalog/product.php`、`catalog/stock.php`、`tool/image.php`、`localisation/language.php`、`setting/store.php`、`catalog/manufacturer.php`、`localisation/stock_status.php`、`localisation/tax_class.php`、`localisation/weight_class.php`、`localisation/length_class.php`、`sale/customer_group.php`、`catalog/download.php`、`catalog/category.php` |
| `office/procurement_plan` | `office/procurement_plan.php`、`office/gys.php`、`sale/order.php`、`catalog/manufacturer.php`、`office/new.php`、`office/procurementconfirm.php` |
| `office/instock` | `office/instock.php`、`office/procurementpay.php`、`office/procurement_plan.php` |
| `sale/order` | `sale/order.php`、`catalog/manufacturer.php`、`setting/store.php`、`catalog/kuweigl.php`、`catalog/product.php`、`localisation/order_status.php`、`sale/customer_group.php`、`localisation/country.php`、`catalog/category.php`、`localisation/zone.php` |
| `sale/stockhistory` | `sale/shoes_cate.php`、`sale/clothes_cate.php`、`sale/stockhistory.php`、`sale/order.php`、`catalog/manufacturer.php`、`catalog/product.php`、`setting/store.php`、`localisation/order_status.php` |
| `sale/orderjt` | `sale/orderjt.php`、`sale/ordermonth.php`、`catalog/manufacturer.php`、`setting/store.php`、`catalog/product.php`、`localisation/order_status.php`、`sale/customer_group.php`、`localisation/country.php`、`catalog/category.php`、`localisation/zone.php` |
| `sale/stockhistoryjt` | `sale/stockhistoryjt.php`、`sale/order.php`、`catalog/manufacturer.php`、`catalog/product.php`、`setting/store.php`、`localisation/order_status.php` |
| `caiwu/orderlistprint` | `caiwu/orderlistprint.php`、`setting/store.php`、`catalog/manufacturer.php`、`catalog/category.php` |
| `wuliuweight/weight` | `wuliuweight/weight.php`、`alipay/downorder.php` |
| `wuliuweight/weightlist` | `wuliuweight/weightlist.php`、`catalog/manufacturer.php`、`office/procurement_plan.php`、`office/gys.php` |
| `query/warehouse_salary_query` | `query/warehousesalarygroups.php`、`query/ordersalaryquery.php` |
| `query/order_salary_query` | `query/ordersalaryquery.php` |
| `user/user` | `user/user.php`、`alipay/store.php`、`user/user_group.php` |
| `user/user_permission` | `user/user_group.php`、`user/user.php` |
| `setting/setting` | `setting/setting.php`、`localisation/currency.php`、`setting/store.php`、`localisation/language.php`、`localisation/country.php`、`localisation/length_class.php`、`localisation/weight_class.php`、`sale/customer_group.php`、`catalog/information.php`、`localisation/order_status.php`、`localisation/stock_status.php`、`tool/image.php`、`localisation/zone.php` |
| `sale/stockhistory_record_clickhouse` | `sale/stockhistoryrecordclickhouse.php` |
| `sale/order_record_clickhouse` | `sale/orderrecordclickhouse.php` |
| `sale/accrual_record_clickhouse` | `sale/accrualrecordclickhouse.php` |
| `caiwu/accrual_record_clickhouse` | `caiwu/accrualrecordclickhouse.php` |
| `wuliuweight/weight_record_clickhouse` | `wuliuweight/weightrecordclickhouse.php` |
| `sale/order_clickhouse` | `sale/orderclickhouse.php`、`catalog/manufacturer.php`、`setting/store.php`、`catalog/kuweigl.php`、`catalog/product.php` |

## 已定位的缺失引用

下列文件被样本控制器引用，但本地文件不存在。未执行对应分支，未将它们归为线上故障。

| 缺失相对路径 | 引用控制器路由 |
|---|---|
| `admin/model/office/new.php` | `office/procurement_plan` |
| `admin/view/template/catalog/cancelproduct.tpl` | `catalog/kuweigl` |
| `admin/view/template/office/new.php` | `office/procurement_plan` |
| `admin/view/template/sale/importswl_form.tpl` | `wuliuweight/weightlist` |
| `admin/view/template/sale/orderjt_form.tpl` | `sale/orderjt` |
| `admin/view/template/sale/orderjt_invoice.tpl` | `sale/orderjt` |

## 运行取证时的动作分类

| 动作类别 | 本轮覆盖 | 后续取证条件 |
|---|---|---|
| 列表、筛选、分页、详情 | 已找到源码结构，未点击运行 | 先检查请求会不会附带写操作，使用隔离的合成数据 |
| 新增、保存、删除、调拨、扫码、称重提交 | 部分控制器声明了相关方法，未执行 | 仅在演示环境逐动作取证，核对副作用 |
| 导出、打包、打印 | 已找到模板或方法，未执行 | 使用合成输入，检查文件名、响应、打印预览和外围依赖 |
| 权限差异 | 已找到菜单条件与框架检查，未读取权限表 | 建立独立演示角色，核验界面与实际访问行为 |

方法名、菜单文字和模板存在性均不足以证明业务成功；不对生产进行遍历点击或批量调用。
