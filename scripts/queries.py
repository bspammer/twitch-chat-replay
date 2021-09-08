ENABLE_FOREIGN_KEYS = "pragma foreign_keys=1;"

CREATE_COMMENTS_COMMENTER_ID_INDEX = "create index if not exists idx_comments_commenter_id on comments (commenterID);"

CREATE_COMMENTS_CONTENT_ID_INDEX = "create index if not exists idx_comments_content_id on comments (contentID);"

CREATE_COMMENTERS_TWITCH_ID_INDEX = "create index if not exists idx_commenters_twitch_id on commenters (twitchID);"

CREATE_COMMENTERS_TABLE = """
create table if not exists commenters (
    id integer primary key autoincrement,
    twitchID text not null unique,
    displayName text not null,
    name text not null,
    bio text,
    logo text,
    type text,
    createdAt datetime not null,
    updatedAt datetime not null
);
"""

CREATE_CONTENT_TABLE = """
create table if not exists content (
    id integer primary key autoincrement,
    twitchID text not null unique,
    userID text not null,
    username text not null,
    title text not null,
    description text not null,
    vodUrl string not null,
    thumbnailUrl string not null,
    viewable text not null,
    viewCount integer not null,
    language text not null,
    type text not null,
    durationSeconds integer not null,
    createdAt datetime not null,
    publishedAt datetime not null
);
"""

CREATE_COMMENTS_TABLE = """
create table if not exists comments (
    id integer primary key autoincrement,
    twitchID text not null,
    commenterID integer not null,
    channelID text not null,
    contentID text not null,
    twitchContentID text not null,
    contentOffsetSeconds integer not null,
    body text not null,
    fragments text not null,
    badges text not null,
    isAction boolean not null,
    color text,
    source text,
    state text,
    createdAt datetime not null,
    updatedAt datetime not null,
    constraint fk_comments_content foreign key (contentID) references content (id),
    constraint fk_comments_commenters foreign key (commenterID) references commenters (id)
);
"""

UPSERT_COMMENTER = """
insert into commenters (
    twitchID,
    displayName,
    name,
    bio,
    logo,
    type,
    createdAt,
    updatedAt
) values (
    :twitchID,
    :displayName,
    :name,
    :bio,
    :logo,
    :type,
    datetime(:createdAt),
    datetime(:updatedAt)
)
on conflict (twitchID) do update set
    displayName=:displayName,
    name=:name,
    bio=:bio,
    logo=:logo,
    type=:type,
    updatedAt=:updatedAt
where :updatedAt > updatedAt;
"""


INSERT_CONTENT = """
insert into content (
    twitchID,
    userID,
    username,
    title,
    description,
    vodUrl,
    thumbnailUrl,
    viewable,
    viewCount,
    language,
    type,
    durationSeconds,
    createdAt,
    publishedAt
) values (
    :twitchID,
    :userID,
    :username,
    :title,
    :description,
    :vodUrl,
    :thumbnailUrl,
    :viewable,
    :viewCount,
    :language,
    :type,
    :durationSeconds,
    datetime(:createdAt),
    coalesce(datetime(:publishedAt), datetime(:createdAt))
);
"""

INSERT_COMMENT = """
insert into comments (
    twitchID,
    commenterID,
    channelID,
    contentID,
    twitchContentID,
    contentOffsetSeconds,
    body,
    fragments,
    badges,
    isAction,
    color,
    source,
    state,
    createdAt,
    updatedAt
) values (
    :twitchID,
    :commenterID,
    :channelID,
    :contentID,
    :twitchContentID,
    :contentOffsetSeconds,
    :body,
    :fragments,
    :badges,
    :isAction,
    :color,
    :source,
    :state,
    datetime(:createdAt),
    datetime(:updatedAt)
);
"""
