export const researchQuery = `
  *[_type == "research" && published == true
    && ($category == "" || category == $category)
  ] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    authorName,
    school,
    abstract,
    category,
    "tags": coalesce(tags, []),
    featured,
    publishedAt,
    "createdAt": _createdAt,
    "views": 0,
    "pdfUrl": pdf.asset->url
  }
`;

export const researchDetailQuery = `
  *[_type == "research" && published == true && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    abstract,
    category,
    "tags": coalesce(tags, []),
    featured,
    publishedAt,
    "createdAt": _createdAt,
    "views": 0,
    "pdfUrl": pdf.asset->url,
    externalUrl,
    doi,
    "authors": select(
      defined(authorName) && authorName != "" => [{ "name": authorName, "affiliation": school }],
      []
    )
  }
`;

export const eventsQuery = `
  *[_type == "event" && published == true
    && ($type == "" || type == $type)
    && ($format == "" || format == $format)
    && ($upcoming == false || dateTime(date) > now())
  ] | order(date asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "startDate": date,
    type,
    format,
    location,
    featured,
    "status": select(
      dateTime(date) > now() => "upcoming",
      "past"
    ),
    "requiresRegistration": false,
    "registeredCount": 0
  }
`;

export const eventDetailQuery = `
  *[_type == "event" && published == true && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    "startDate": date,
    type,
    format,
    location,
    featured,
    "status": select(
      dateTime(date) > now() => "upcoming",
      "past"
    ),
    "requiresRegistration": false,
    "registeredCount": 0,
    "capacity": null,
    "timezone": coalesce(timezone, "UTC"),
    virtualLink,
    "speakers": coalesce(speakers, []),
    "tags": coalesce(tags, [])
  }
`;

export const announcementsQuery = `
  *[_type == "announcement" && published == true
    && ($category == "" || category == $category)
  ] | order(pinned desc, publishedAt desc) {
    _id,
    title,
    content,
    category,
    pinned,
    featured,
    "publishedAt": coalesce(publishedAt, _createdAt)
  }
`;
