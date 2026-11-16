# 没有表：同一个集合里的文档，各有各的字段，不用事先声明。
source "$(dirname "$0")/lab_common.sh"
fresh; start
m 'db.people.insertMany([{ name: "Alice", age: 42 }, { name: "Erin", email: "erin@example.com", tags: ["db", "go"] }, { name: "Frank", address: { city: "Lisbon" } }]).insertedIds'
m 'db.people.find({}, { _id: 0 }).toArray()'
m 'db.getCollectionInfos({ name: "people" })[0].options'
m 'db.people.find({}, { _id: 0 }).toArray().map(d => [d.name, bsonsize(d)])'
stop
