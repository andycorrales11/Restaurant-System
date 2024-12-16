SELECT 
    ingredient.inventoryid, ARRAY_AGG(menu_items.uniqueid) 
FROM ingredient 
JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid 
GROUP BY ingredient.inventoryid;

SELECT 
    supply.inventoryid, ARRAY_AGG(item_type.uniqueid) 
FROM supply 
JOIN item_type ON item_type.uniqueid = supply.item_typeid 
GROUP BY supply.inventoryid;

SELECT
    menu_items.uniqueid
FROM ingredient
JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid
WHERE ingredient.inventoryid=29;

SELECT
    item_type.uniqueid
FROM supply
JOIN item_type ON item_type.uniqueid = supply.item_typeid
WHERE supply.inventoryid=51;

SELECT 
    DATE(date_of_sale) AS sale_date, 
    SUM(order_total) AS sales
FROM order_history
WHERE date_of_sale BETWEEN '2024-11-27T00:00:00' AND '2024-12-05T23:59:59'
GROUP BY DATE(date_of_sale)
ORDER BY sale_date;

SELECT
    DATE(order_history.date_of_sale) AS sale_date,
    COUNT(items.uniqueid) AS quantity
FROM order_history
INNER JOIN item_in_order ON order_history.uniqueid=item_in_order.order_historyid
INNER JOIN items ON item_in_order.itemid=items.uniqueid
INNER JOIN menu_items sd ON sd.uniqueid = items.side
INNER JOIN menu_items e1 ON e1.uniqueid = items.entree1
INNER JOIN menu_items e2 ON e2.uniqueid = items.entree2
INNER JOIN menu_items e3 ON e3.uniqueid = items.entree3
WHERE
    order_history.date_of_sale BETWEEN '2024-11-27T00:00:00' AND '2024-12-05T23:59:59'
    AND (sd.uniqueid=28 OR e1.uniqueid=28 OR e2.uniqueid=28 OR e3.uniqueid=28)
GROUP BY DATE(order_history.date_of_sale)
ORDER BY DATE(order_history.date_of_sale);

SELECT
    DATE(order_history.date_of_sale) AS sale_date,
    COUNT(items.uniqueid) AS quantity
FROM order_history
INNER JOIN item_in_order ON order_history.uniqueid=item_in_order.order_historyid
INNER JOIN items ON item_in_order.itemid=items.uniqueid
INNER JOIN item_type ON item_type.uniqueid = items.item_t
WHERE
    order_history.date_of_sale BETWEEN '2024-11-27T00:00:00' AND '2024-12-05T23:59:59'
    AND (item_type.uniqueid=7)
GROUP BY DATE(order_history.date_of_sale)
ORDER BY DATE(order_history.date_of_sale);

SELECT
    order_history.uniqueid, order_history.date_of_sale, employees.name
FROM order_history
JOIN employees ON order_history.employee=employees.uniqueid
WHERE DATE(order_history.date_of_sale)='2024-12-05'
ORDER BY order_history.date_of_sale DESC;

SELECT 
    inventory.uniqueid, inventory.description
FROM ingredient 
JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid 
JOIN inventory ON inventory.uniqueid = ingredient.inventoryid
WHERE menu_items.uniqueid=4;