import { defineField, defineType } from 'sanity';

export const announcementType = defineType({
  name: 'announcement',
  title: 'Announcements',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'content', title: 'Content', type: 'text', rows: 5 }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      initialValue: 'general',
      options: {
        list: [
          { value: 'general', title: 'General' },
          { value: 'event', title: 'Event' },
          { value: 'research', title: 'Research' },
          { value: 'partnership', title: 'Partnership' },
          { value: 'opportunity', title: 'Opportunity' },
          { value: 'update', title: 'Update' },
        ],
      },
    }),
    defineField({ name: 'pinned', title: 'Pinned', type: 'boolean', initialValue: false }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'published', title: 'Published', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
});
