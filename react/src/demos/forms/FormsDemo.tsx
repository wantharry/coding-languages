import Section from '../../components/Section'
import ControlledForm from './ControlledForm'
import UncontrolledForm from './UncontrolledForm'

export default function FormsDemo() {
  return (
    <Section
      title="Controlled vs uncontrolled components"
      concept={
        'Same email form, two philosophies. The controlled version can ' +
        'validate on every keystroke because React state IS the value. ' +
        "The uncontrolled version doesn't re-render while typing at all — " +
        'it only reads the DOM node, via a ref, at submit time.'
      }
    >
      <div className="side-by-side">
        <ControlledForm />
        <UncontrolledForm />
      </div>
    </Section>
  )
}
