import { sequelize } from '../config/database';
import { User, initUser } from './User';
import { Account, initAccount } from './Account';
import { Category, initCategory } from './Category';
import { CategoryRule, initCategoryRule } from './CategoryRule';
import { Transaction, initTransaction } from './Transaction';
import { CardInvoice, initCardInvoice } from './CardInvoice';
import { CardInvoiceItem, initCardInvoiceItem } from './CardInvoiceItem';
import { Goal, initGoal } from './Goal';

initUser(sequelize);
initAccount(sequelize);
initCategory(sequelize);
initCategoryRule(sequelize);
initTransaction(sequelize);
initCardInvoice(sequelize);
initCardInvoiceItem(sequelize);
initGoal(sequelize);

Account.hasMany(Transaction, { foreignKey: 'accountId' });
Transaction.belongsTo(Account, { foreignKey: 'accountId' });

Category.hasMany(Transaction, { foreignKey: 'categoryId' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(CategoryRule, { foreignKey: 'categoryId' });
CategoryRule.belongsTo(Category, { foreignKey: 'categoryId' });

Account.hasMany(CardInvoice, { foreignKey: 'accountId' });
CardInvoice.belongsTo(Account, { foreignKey: 'accountId' });

Transaction.hasOne(CardInvoice, { foreignKey: 'transactionId' });
CardInvoice.belongsTo(Transaction, { foreignKey: 'transactionId' });

CardInvoice.hasMany(CardInvoiceItem, { foreignKey: 'cardInvoiceId', as: 'itens' });
CardInvoiceItem.belongsTo(CardInvoice, { foreignKey: 'cardInvoiceId' });

Category.hasMany(CardInvoiceItem, { foreignKey: 'categoryId' });
CardInvoiceItem.belongsTo(Category, { foreignKey: 'categoryId' });

Account.hasMany(Goal, { foreignKey: 'accountId' });
Goal.belongsTo(Account, { foreignKey: 'accountId' });

export { sequelize, User, Account, Category, CategoryRule, Transaction, CardInvoice, CardInvoiceItem, Goal };
