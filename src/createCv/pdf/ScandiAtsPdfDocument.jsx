import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { hasCustomSectionContent, isCustomSectionId } from '../cvDocument'
import { CV_ALL_SECTION_IDS } from '../fieldVisibility'
import {
  formatDateRange,
  isFieldVisible,
  linkLabel,
  nonEmptyLines,
} from './helpers'
import { formatPhoneForDisplay } from '../../utils/phoneFormat'
import { PDF_TOKENS as T, mm } from './tokens'

const styles = StyleSheet.create({
  page: {
    fontFamily: T.font.family,
    fontSize: T.font.body,
    color: T.color.text,
    lineHeight: T.line.body,
    paddingTop: T.page.paddingTop,
    paddingBottom: T.page.paddingBottom,
    paddingHorizontal: T.page.paddingHorizontal,
  },
  header: {
    borderBottomWidth: 0.75,
    borderBottomColor: T.color.rule,
    paddingBottom: T.space.headerPadBottom,
    marginBottom: T.space.headerBottom,
  },
  name: {
    fontSize: T.font.name,
    fontWeight: 700,
    lineHeight: T.line.name,
    letterSpacing: -0.3,
    color: T.color.heading,
    marginBottom: T.space.nameBottom,
  },
  jobTitle: {
    fontSize: T.font.title,
    fontWeight: 500,
    color: T.color.soft,
    marginBottom: T.space.titleBottom,
  },
  contact: {
    fontSize: T.font.contact,
    color: T.color.muted,
    marginBottom: 1,
  },
  linkLine: {
    fontSize: T.font.small,
    color: T.color.soft,
    marginTop: 1,
  },
  linkLabel: {
    fontWeight: 700,
    color: T.color.muted,
  },
  metaItem: {
    fontSize: T.font.small,
    color: T.color.soft,
    marginTop: mm(1),
  },
  section: {
    marginTop: T.space.sectionTop,
  },
  sectionTitle: {
    fontSize: T.font.section,
    fontWeight: 700,
    letterSpacing: 1.1,
    color: T.color.heading,
    borderBottomWidth: 0.75,
    borderBottomColor: T.color.rule,
    paddingBottom: T.space.sectionTitlePadBottom,
    marginBottom: T.space.sectionTitleBottom,
  },
  summary: {
    fontSize: T.font.body,
    color: T.color.text,
    lineHeight: T.line.summary,
  },
  entry: {
    marginBottom: T.space.entryBottom,
  },
  entryHead: {
    fontSize: T.font.entryHead,
    fontWeight: 600,
    color: T.color.entry,
    marginBottom: 1,
  },
  entryAt: {
    fontWeight: 500,
    color: T.color.muted,
  },
  entryMeta: {
    fontSize: T.font.meta,
    color: T.color.soft,
    marginBottom: 2,
  },
  entryText: {
    fontSize: T.font.entryText,
    color: T.color.text,
    lineHeight: T.line.body,
    marginTop: 1,
  },
  bullet: {
    flexDirection: 'row',
    marginTop: 0.5,
    paddingLeft: 0,
  },
  bulletDot: {
    width: 8,
    fontSize: T.font.entryText,
    color: T.color.text,
  },
  bulletText: {
    flex: 1,
    fontSize: T.font.entryText,
    color: T.color.text,
    lineHeight: T.line.body,
  },
  subheading: {
    fontSize: T.font.section,
    fontWeight: 700,
    color: T.color.text,
    marginTop: 1.5,
    marginBottom: 0.5,
  },
  skillLine: {
    fontSize: T.font.entryText,
    color: T.color.text,
    marginBottom: 0.5,
  },
})

function sectionHeading(title) {
  // Turkish-aware uppercase (i → İ). CSS text-transform is not locale-safe in react-pdf.
  return String(title || '').toLocaleUpperCase('tr-TR')
}

function Section({ title, children }) {
  if (!children) return null
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{sectionHeading(title)}</Text> : null}
      {children}
    </View>
  )
}

function Bullets({ items }) {
  const filled = nonEmptyLines(items)
  if (!filled.length) return null
  return (
    <View>
      {filled.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

function PersonalHeader({ personal, t, fieldVisibility }) {
  const vis = (field) => isFieldVisible(fieldVisibility, field)
  const name = personal.fullName?.trim()
  const title = personal.jobTitle?.trim()
  if (!name && !title) return null

  const contact = [
    vis('email') && personal.email?.trim(),
    vis('phone') && formatPhoneForDisplay(personal.phone),
    vis('location') && personal.location?.trim(),
  ].filter(Boolean)

  const links = [
    ['linkedin', personal.linkedin],
    ['github', personal.github],
    ['stackoverflow', personal.stackoverflow],
    ['portfolio', personal.portfolio],
    ['behance', personal.behance],
    ['dribbble', personal.dribbble],
  ].filter(([key, href]) => vis(key) && href?.trim())

  const metaFields = [
    'dateOfBirth', 'drivingLicense', 'licenseClass', 'adrCertificate', 'drivingExperience',
    'medicalLicense', 'specialty', 'residency', 'teachingSubjects', 'teachingCertificate',
    'accountingSoftware', 'taxExperience', 'flightHours', 'aircraftTypes', 'pilotLicense',
    'clinicalExperience', 'nurseCertifications', 'salesTarget', 'crmExperience',
    'cuisineTypes', 'michelinExperience', 'pmp', 'autocad', 'sap2000', 'adobeSkills',
  ]
  const extraMeta = metaFields
    .filter((field) => vis(field) && personal[field]?.trim())
    .map((field) => `${t(`createCv.${field}`)}: ${personal[field].trim()}`)

  if (
    vis('militaryStatus')
    && personal.militaryStatus
    && personal.militaryStatus !== 'notApplicable'
  ) {
    extraMeta.push(
      `${t('createCv.militaryStatus')}: ${t(`createCv.military.${personal.militaryStatus}`)}`,
    )
  }

  return (
    <View style={styles.header}>
      {name ? <Text style={styles.name}>{name}</Text> : null}
      {title ? <Text style={styles.jobTitle}>{title}</Text> : null}
      {contact.length > 0 ? <Text style={styles.contact}>{contact.join(' · ')}</Text> : null}
      {links.length > 0 ? (
        <Text style={styles.linkLine}>
          {links.map(([key, href], index) => (
            <Text key={key}>
              {index > 0 ? ' · ' : ''}
              <Text style={styles.linkLabel}>{t(`createCv.${key}`)}: </Text>
              {linkLabel(href)}
            </Text>
          ))}
        </Text>
      ) : null}
      {extraMeta.length > 0 ? (
        <Text style={styles.metaItem}>{extraMeta.join(' · ')}</Text>
      ) : null}
    </View>
  )
}

function ExperienceSection({ items, t }) {
  const filled = (items || []).filter((item) => (
    item.company?.trim() || item.position?.trim() || item.bullets?.some((b) => b?.trim())
  ))
  if (!filled.length) return null

  return (
    <Section title={t('createCv.preview.experienceHeading')}>
      {filled.map((item) => (
        <View key={item.id} style={styles.entry}>
          <Text style={styles.entryHead}>
            {item.position?.trim() || t('createCv.preview.positionPlaceholder')}
            {item.company?.trim() ? (
              <Text style={styles.entryAt}>{` @ ${item.company.trim()}`}</Text>
            ) : null}
          </Text>
          {(item.location?.trim() || item.startDate || item.endDate) ? (
            <Text style={styles.entryMeta}>
              {[
                item.location?.trim(),
                formatDateRange(item.startDate, item.endDate, item.currentlyWorking, t),
              ].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          <Bullets items={item.bullets} />
          {nonEmptyLines(item.achievements).length > 0 ? (
            <>
              <Text style={styles.subheading}>{t('createCv.achievements')}</Text>
              <Bullets items={item.achievements} />
            </>
          ) : null}
        </View>
      ))}
    </Section>
  )
}

function EducationSection({ items, t }) {
  const filled = (items || []).filter((item) => item.school?.trim() || item.degree?.trim())
  if (!filled.length) return null

  return (
    <Section title={t('createCv.preview.educationHeading')}>
      {filled.map((item) => (
        <View key={item.id} style={styles.entry}>
          <Text style={styles.entryHead}>
            {item.degree?.trim() || t('createCv.preview.degreePlaceholder')}
            {item.school?.trim() ? (
              <Text style={styles.entryAt}>{` — ${item.school.trim()}`}</Text>
            ) : null}
          </Text>
          <Text style={styles.entryMeta}>
            {[
              item.department?.trim(),
              item.location?.trim(),
              formatDateRange(item.startDate, item.endDate, false, t),
              item.gpa?.trim() && `${t('createCv.gpa')}: ${item.gpa.trim()}`,
            ].filter(Boolean).join(' · ')}
          </Text>
          {item.description?.trim() ? (
            <Text style={styles.entryText}>{item.description.trim()}</Text>
          ) : null}
        </View>
      ))}
    </Section>
  )
}

function SkillsSection({ skills, t }) {
  if (!skills) return null

  if (skills.mode === 'rated') {
    const filled = skills.rated?.filter((item) => item.name?.trim()) || []
    if (!filled.length) return null
    return (
      <Section title={t('createCv.preview.skillsHeading')}>
        {filled.map((item) => (
          <Text key={item.id} style={styles.skillLine}>
            {item.name.trim()}{' '}
            {'★'.repeat(item.level || 0)}{'☆'.repeat(Math.max(0, 5 - (item.level || 0)))}
          </Text>
        ))}
      </Section>
    )
  }

  const filled = skills.categories?.filter((cat) => (
    cat.name?.trim() || cat.skills?.some((s) => s?.trim())
  )) || []
  if (!filled.length) return null

  return (
    <Section title={t('createCv.preview.skillsHeading')}>
      {filled.map((category) => (
        <View key={category.id} style={styles.entry}>
          {category.name?.trim() ? (
            <Text style={styles.subheading}>{category.name.trim()}</Text>
          ) : null}
          <Text style={styles.skillLine}>
            {category.skills.filter((s) => s?.trim()).join(' · ')}
          </Text>
        </View>
      ))}
    </Section>
  )
}

function ProjectsSection({ items, t }) {
  const filled = (items || []).filter((item) => item.name?.trim() || item.description?.trim())
  if (!filled.length) return null

  return (
    <Section title={t('createCv.preview.projectsHeading')}>
      {filled.map((item) => (
        <View key={item.id} style={styles.entry}>
          {item.name?.trim() ? <Text style={styles.entryHead}>{item.name.trim()}</Text> : null}
          <Text style={styles.entryMeta}>
            {[
              formatDateRange(item.startDate, item.endDate, false, t),
              item.technologies?.trim(),
            ].filter(Boolean).join(' · ')}
          </Text>
          {item.description?.trim() ? (
            <Text style={styles.entryText}>{item.description.trim()}</Text>
          ) : null}
          {(item.github?.trim() || item.demo?.trim()) ? (
            <Text style={styles.entryMeta}>
              {[
                item.github?.trim() && `GitHub: ${linkLabel(item.github)}`,
                item.demo?.trim() && `Demo: ${linkLabel(item.demo)}`,
              ].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      ))}
    </Section>
  )
}

function SimpleEntries({ title, items, mapItem }) {
  const filled = (items || []).map(mapItem).filter(Boolean)
  if (!filled.length) return null
  return (
    <Section title={title}>
      {filled.map((node) => node)}
    </Section>
  )
}

function CustomSection({ custom, t }) {
  if (!hasCustomSectionContent(custom)) return null
  const title = custom.title?.trim() || t('createCv.custom.fallbackTitle')
  return (
    <Section title={title}>
      {custom.subtitle?.trim() ? (
        <Text style={styles.entryMeta}>{custom.subtitle.trim()}</Text>
      ) : null}
      {custom.mode === 'bullets' ? (
        <Bullets items={custom.bullets} />
      ) : (
        custom.body?.trim()
          ? <Text style={styles.entryText}>{custom.body.trim()}</Text>
          : null
      )}
    </Section>
  )
}

function renderSection(sectionId, { content, t, fieldVisibility }) {
  const customSections = content.customSections || {}

  if (isCustomSectionId(sectionId)) {
    return (
      <CustomSection
        key={sectionId}
        custom={customSections[sectionId]}
        t={t}
      />
    )
  }

  switch (sectionId) {
    case 'personal':
      return (
        <PersonalHeader
          key="personal"
          personal={content.personal || {}}
          t={t}
          fieldVisibility={fieldVisibility}
        />
      )
    case 'summary':
      if (!content.summary?.trim()) return null
      return (
        <Section key="summary" title={t('createCv.preview.summaryHeading')}>
          <Text style={styles.summary}>{content.summary.trim()}</Text>
        </Section>
      )
    case 'experience':
      return <ExperienceSection key="experience" items={content.experience} t={t} />
    case 'education':
      return <EducationSection key="education" items={content.education} t={t} />
    case 'skills':
      return <SkillsSection key="skills" skills={content.skills} t={t} />
    case 'projects':
      return <ProjectsSection key="projects" items={content.projects} t={t} />
    case 'certifications':
      return (
        <SimpleEntries
          key="certifications"
          title={t('createCv.preview.certificationsHeading')}
          items={content.certifications}
          mapItem={(item) => {
            if (!item.name?.trim()) return null
            return (
              <View key={item.id} style={styles.entry}>
                <Text style={styles.entryHead}>{item.name.trim()}</Text>
                <Text style={styles.entryMeta}>
                  {[item.issuer?.trim(), item.issueDate?.trim()].filter(Boolean).join(' · ')}
                </Text>
                {item.credentialUrl?.trim() ? (
                  <Text style={styles.entryMeta}>{linkLabel(item.credentialUrl)}</Text>
                ) : null}
              </View>
            )
          }}
        />
      )
    case 'languages':
      return (
        <SimpleEntries
          key="languages"
          title={t('createCv.preview.languagesHeading')}
          items={content.languages}
          mapItem={(item) => {
            if (!item.name?.trim()) return null
            return (
              <Text key={item.id} style={styles.skillLine}>
                {item.name.trim()}
                {item.level?.trim() ? ` — ${item.level.trim()}` : ''}
              </Text>
            )
          }}
        />
      )
    case 'awards':
      return (
        <SimpleEntries
          key="awards"
          title={t('createCv.preview.awardsHeading')}
          items={content.awards}
          mapItem={(item) => {
            if (!item.title?.trim()) return null
            return (
              <View key={item.id} style={styles.entry}>
                <Text style={styles.entryHead}>{item.title.trim()}</Text>
                <Text style={styles.entryMeta}>
                  {[item.issuer?.trim(), item.date?.trim()].filter(Boolean).join(' · ')}
                </Text>
                {item.description?.trim() ? (
                  <Text style={styles.entryText}>{item.description.trim()}</Text>
                ) : null}
              </View>
            )
          }}
        />
      )
    case 'volunteer':
      return (
        <SimpleEntries
          key="volunteer"
          title={t('createCv.preview.volunteerHeading')}
          items={content.volunteer}
          mapItem={(item) => {
            if (!item.organization?.trim() && !item.role?.trim()) return null
            return (
              <View key={item.id} style={styles.entry}>
                <Text style={styles.entryHead}>
                  {item.role?.trim() || item.organization?.trim()}
                  {item.organization?.trim() && item.role?.trim()
                    ? <Text style={styles.entryAt}>{` — ${item.organization.trim()}`}</Text>
                    : null}
                </Text>
                <Text style={styles.entryMeta}>
                  {formatDateRange(item.startDate, item.endDate, false, t)}
                </Text>
                {item.description?.trim() ? (
                  <Text style={styles.entryText}>{item.description.trim()}</Text>
                ) : null}
              </View>
            )
          }}
        />
      )
    case 'publications':
      return (
        <SimpleEntries
          key="publications"
          title={t('createCv.preview.publicationsHeading')}
          items={content.publications}
          mapItem={(item) => {
            if (!item.title?.trim()) return null
            return (
              <View key={item.id} style={styles.entry}>
                <Text style={styles.entryHead}>{item.title.trim()}</Text>
                <Text style={styles.entryMeta}>
                  {[item.publisher?.trim(), item.date?.trim()].filter(Boolean).join(' · ')}
                </Text>
                {item.url?.trim() ? (
                  <Text style={styles.entryMeta}>{linkLabel(item.url)}</Text>
                ) : null}
              </View>
            )
          }}
        />
      )
    case 'references':
      return (
        <SimpleEntries
          key="references"
          title={t('createCv.preview.referencesHeading')}
          items={content.references}
          mapItem={(item) => {
            if (!item.name?.trim()) return null
            return (
              <View key={item.id} style={styles.entry}>
                <Text style={styles.entryHead}>{item.name.trim()}</Text>
                <Text style={styles.entryMeta}>
                  {[
                    item.relationship?.trim(),
                    item.company?.trim(),
                    item.email?.trim(),
                    formatPhoneForDisplay(item.phone),
                  ].filter(Boolean).join(' · ')}
                </Text>
              </View>
            )
          }}
        />
      )
    case 'sidebar':
      return null
    default:
      return null
  }
}

/**
 * Scandi ATS text PDF — same CV data as HTML preview, separate renderer.
 */
export default function ScandiAtsPdfDocument({
  document,
  t,
  visibleSectionIds = [],
  fieldVisibility = {},
}) {
  const content = document?.content || {}
  const orderedIds = visibleSectionIds.length > 0 ? visibleSectionIds : CV_ALL_SECTION_IDS

  return (
    <Document
      title={content.personal?.fullName?.trim() || 'CV'}
      author={content.personal?.fullName?.trim() || 'cveey'}
      creator="cveey"
    >
      <Page size="A4" style={styles.page}>
        {orderedIds.map((sectionId) => renderSection(sectionId, {
          content,
          t,
          fieldVisibility,
        }))}
      </Page>
    </Document>
  )
}
