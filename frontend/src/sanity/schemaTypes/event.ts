import { defineField, defineType } from 'sanity';

export const eventType = defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'date', title: 'Date', type: 'datetime', validation: Rule => Rule.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'timezone', title: 'Timezone', type: 'string', initialValue: 'UTC' }),
    defineField({ name: 'virtualLink', title: 'Virtual Join Link', type: 'url' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'type',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { value: 'workshop', title: 'Workshop' },
          { value: 'seminar', title: 'Seminar' },
          { value: 'conference', title: 'Conference' },
          { value: 'webinar', title: 'Webinar' },
          { value: 'competition', title: 'Competition' },
          { value: 'meetup', title: 'Meetup' },
          { value: 'other', title: 'Other' },
        ],
      },
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { value: 'virtual', title: 'Virtual' },
          { value: 'in-person', title: 'In-Person' },
          { value: 'hybrid', title: 'Hybrid' },
        ],
      },
    }),
    defineField({
      name: 'speakers',
      title: 'Speakers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'affiliation', title: 'Affiliation', type: 'string' }),
            defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 2 }),
          ],
        },
      ],
    }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'published', title: 'Published', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
  },
});
