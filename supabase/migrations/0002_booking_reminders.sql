alter table bookings add column reminded_24h boolean not null default false;
alter table bookings add column reminded_1h boolean not null default false;
