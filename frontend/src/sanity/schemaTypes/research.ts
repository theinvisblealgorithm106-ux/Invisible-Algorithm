import { defineField, defineType } from 'sanity';

export const researchType = defineType({
  name: 'research',
  title: 'Research Papers',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'authorName', title: 'Author Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'school', title: 'School / Organization', type: 'string' }),
    defineField({ name: 'topic', title: 'Research Topic', type: 'string' }),
    defineField({ name: 'abstract', title: 'Description / Abstract', type: 'text', rows: 5 }),
    defineField({ name: 'pdf', title: 'PDF Upload', type: 'file', options: { accept: '.pdf' } }),
    defineField({ name: 'externalUrl', title: 'External URL', type: 'url' }),
    defineField({ name: 'doi', title: 'DOI', type: 'string' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { value: 'artificial-intelligence', title: 'Artificial Intelligence' },
          { value: 'machine-learning', title: 'Machine Learning' },
          { value: 'computer-science', title: 'Computer Science' },
          { value: 'finance', title: 'Finance' },
          { value: 'data-science', title: 'Data Science' },
          { value: 'other', title: 'Other' },
        ],
      },
    }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'published', title: 'Published', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', title: 'Publication Date', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'authorName' },
  },
});
